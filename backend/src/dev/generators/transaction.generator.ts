import TransactionController from '../../controller/transactionController';
import { SelectAccount, SelectCreditCard, SelectTransaction, SelectTag } from '../../db/schema';
import { CategoryType, TransactionSource, TransactionType } from '../../utils/enum';
import { CategorySeed } from './category.generator';
import {
    SeedContext,
    clamp,
    distributeCount,
    executeController,
    formatObservation,
    randomDateBetween,
    randomDateWithDay,
    roundCurrency
} from '../seed.utils';

type TransactionRequestBody = {
    value: number;
    date: Date;
    category_id?: number;
    subcategory_id?: number;
    observation?: string;
    transactionType: TransactionType;
    transactionSource: TransactionSource;
    isInstallment: boolean;
    totalMonths?: number;
    isRecurring: boolean;
    paymentDay?: number;
    account_id?: number;
    creditCard_id?: number;
    tags?: number[];
    active?: boolean;
};

export type TransactionSummary = {
    total: number;
    accountCount: number;
    creditCardCount: number;
    incomeCount: number;
    expenseCount: number;
};

type TransactionSeedInput = {
    userId: number;
    accounts: SelectAccount[];
    creditCards: SelectCreditCard[];
    categories: CategorySeed[];
    tags: SelectTag[];
    startDate: Date;
    endDate: Date;
};

/**
 * Creates transactions for a user using the TransactionController.
 *
 * @summary Generates realistic transactions across accounts and credit cards.
 */
export async function createTransactions(
    context: SeedContext,
    input: TransactionSeedInput
): Promise<TransactionSummary> {
    if (input.accounts.length === 0) {
        throw new Error('SeedInvariantViolation: no accounts available for transactions.');
    }

    const total = context.random.int(context.config.transactionsPerUser.min, context.config.transactionsPerUser.max);
    const creditCardCount = calculateCreditCardCount(context, total, input.creditCards.length);
    const accountCount = Math.max(0, total - creditCardCount);
    const incomeCount = calculateIncomeCount(context, accountCount);
    const accountExpenseCount = Math.max(0, accountCount - incomeCount);

    const incomeCategories = input.categories.filter(category => category.template.type === CategoryType.INCOME);
    const expenseCategories = input.categories.filter(category => category.template.type === CategoryType.EXPENSE);

    if (incomeCategories.length === 0 || expenseCategories.length === 0) {
        throw new Error('SeedInvariantViolation: missing income or expense categories.');
    }

    const incomeByAccount = distributeCount(context.random, incomeCount, input.accounts.length);
    const expenseByAccount = distributeCount(context.random, accountExpenseCount, input.accounts.length, accountExpenseCount >= input.accounts.length ? 1 : 0);
    const expenseByCard = distributeCount(
        context.random,
        creditCardCount,
        input.creditCards.length,
        creditCardCount >= input.creditCards.length ? 1 : 0
    );

    for (let i = 0; i < input.accounts.length; i += 1) {
        const account = input.accounts[i];
        await createAccountTransactions(context, account.id, incomeByAccount[i], TransactionType.INCOME, incomeCategories, input);
        await createAccountTransactions(context, account.id, expenseByAccount[i], TransactionType.EXPENSE, expenseCategories, input);
    }

    for (let i = 0; i < input.creditCards.length; i += 1) {
        const card = input.creditCards[i];
        await createCardTransactions(context, card.id, expenseByCard[i], expenseCategories, input);
    }

    return {
        total,
        accountCount,
        creditCardCount,
        incomeCount,
        expenseCount: accountExpenseCount + creditCardCount,
    };
}

/**
 * Creates account transactions for a specific account.
 *
 * @summary Seeds account-based transactions with the requested type.
 */
async function createAccountTransactions(
    context: SeedContext,
    accountId: number,
    count: number,
    type: TransactionType,
    categories: CategorySeed[],
    input: TransactionSeedInput
) {
    if (count <= 0) return;

    for (let i = 0; i < count; i += 1) {
        const categorySeed = context.random.pickOne(categories);
        const body = buildTransactionBody(context, {
            source: TransactionSource.ACCOUNT,
            accountId,
            creditCardId: undefined,
            categorySeed,
            transactionType: type,
            startDate: input.startDate,
            endDate: input.endDate,
            tags: input.tags,
        });

        await executeController<SelectTransaction>(TransactionController.createTransaction, {
            body,
            language: context.language,
            userId: input.userId,
        });
    }
}

/**
 * Creates credit card transactions for a specific card.
 *
 * @summary Seeds credit card expense transactions.
 */
async function createCardTransactions(
    context: SeedContext,
    creditCardId: number,
    count: number,
    categories: CategorySeed[],
    input: TransactionSeedInput
) {
    if (count <= 0) return;

    for (let i = 0; i < count; i += 1) {
        const categorySeed = context.random.pickOne(categories);
        const body = buildTransactionBody(context, {
            source: TransactionSource.CREDIT_CARD,
            accountId: undefined,
            creditCardId,
            categorySeed,
            transactionType: TransactionType.EXPENSE,
            startDate: input.startDate,
            endDate: input.endDate,
            tags: input.tags,
        });

        await executeController<SelectTransaction>(TransactionController.createTransaction, {
            body,
            language: context.language,
            userId: input.userId,
        });
    }
}

type BuildTransactionParams = {
    source: TransactionSource;
    accountId?: number;
    creditCardId?: number;
    categorySeed: CategorySeed;
    transactionType: TransactionType;
    startDate: Date;
    endDate: Date;
    tags: SelectTag[];
};

/**
 * Builds a transaction request body for controller submission.
 *
 * @summary Maps category and source data into a validated request payload.
 */
function buildTransactionBody(context: SeedContext, params: BuildTransactionParams): TransactionRequestBody {
    const { categorySeed, transactionType } = params;
    const subcategory = shouldUseSubcategory(context, categorySeed) ? context.random.pickOne(categorySeed.subcategories) : undefined;
    const tokens = {
        merchant: context.random.pickOne(categorySeed.template.merchants),
        category: categorySeed.template.name,
        subcategory: subcategory?.name ?? categorySeed.template.name,
    };
    const observation = context.random.chance(context.config.transactionDistribution.observationChance)
        ? formatObservation(context.random.pickOne(categorySeed.template.observationTemplates), tokens)
        : undefined;

    const { isInstallment, totalMonths, isRecurring, paymentDay } = buildTransactionFlags(context, params.source, categorySeed);
    const date = isRecurring && paymentDay
        ? randomDateWithDay(context.random, params.startDate, params.endDate, paymentDay)
        : randomDateBetween(context.random, params.startDate, params.endDate);
    const value = buildAmount(context, transactionType, categorySeed.template.amountRange);
    const tagIds = pickTransactionTags(context, params.tags);

    return {
        value,
        date,
        category_id: categorySeed.category.id,
        ...(subcategory ? { subcategory_id: subcategory.id } : {}),
        ...(observation ? { observation } : {}),
        transactionType,
        transactionSource: params.source,
        isInstallment,
        ...(totalMonths ? { totalMonths } : {}),
        isRecurring,
        ...(paymentDay ? { paymentDay } : {}),
        ...(params.accountId ? { account_id: params.accountId } : {}),
        ...(params.creditCardId ? { creditCard_id: params.creditCardId } : {}),
        ...(tagIds ? { tags: tagIds } : {}),
        active: true,
    };
}

/**
 * Determines installment and recurring flags for a transaction.
 *
 * @summary Computes installment/recurring metadata based on category defaults.
 */
function buildTransactionFlags(
    context: SeedContext,
    source: TransactionSource,
    categorySeed: CategorySeed
): { isInstallment: boolean; totalMonths?: number; isRecurring: boolean; paymentDay?: number } {
    const installmentChance = categorySeed.template.installmentChance ?? context.config.installmentDefaults.chance;
    const recurringChance = categorySeed.template.recurringChance ?? context.config.recurringDefaults.chance;
    const canInstall = source === TransactionSource.CREDIT_CARD;
    const isInstallment = canInstall && context.random.chance(installmentChance);
    const totalMonths = isInstallment ? context.random.int(context.config.installmentDefaults.minMonths, context.config.installmentDefaults.maxMonths) : undefined;
    const isRecurring = !isInstallment && context.random.chance(recurringChance);
    const paymentDay = isRecurring ? context.random.int(context.config.recurringDefaults.minDay, context.config.recurringDefaults.maxDay) : undefined;

    return { isInstallment, totalMonths, isRecurring, paymentDay };
}

/**
 * Generates a realistic transaction amount within a category range.
 *
 * @summary Produces a skewed amount matching income/expense behavior.
 */
function buildAmount(
    context: SeedContext,
    transactionType: TransactionType,
    range: { min: number; max: number }
): number {
    const bias = transactionType === TransactionType.INCOME ? 0.75 : 1.45;
    const spread = range.max - range.min;
    const scaled = Math.pow(context.random.float(0, 1), bias);
    const value = range.min + spread * scaled;
    return roundCurrency(value);
}

/**
 * Determines if a subcategory should be applied.
 *
 * @summary Applies subcategory usage probabilities.
 */
function shouldUseSubcategory(context: SeedContext, categorySeed: CategorySeed): boolean {
    if (categorySeed.subcategories.length === 0) {
        return false;
    }
    return context.random.chance(context.config.transactionDistribution.subcategoryChance);
}

/**
 * Calculates how many transactions should be tied to credit cards.
 *
 * @summary Allocates a share of transactions to credit cards.
 */
function calculateCreditCardCount(context: SeedContext, total: number, cardCount: number): number {
    if (cardCount === 0) return 0;
    const share = context.random.float(context.config.transactionDistribution.creditCardShare.min, context.config.transactionDistribution.creditCardShare.max);
    const desired = Math.round(total * share);
    const min = context.config.transactionDistribution.minCreditCardTransactions;
    const max = Math.max(1, total - 1);
    return clamp(desired, Math.min(min, max), max);
}

/**
 * Calculates how many account transactions should be income.
 *
 * @summary Allocates a share of account transactions to income.
 */
function calculateIncomeCount(context: SeedContext, accountTotal: number): number {
    if (accountTotal === 0) return 0;
    const share = context.random.float(context.config.transactionDistribution.incomeShare.min, context.config.transactionDistribution.incomeShare.max);
    const desired = Math.round(accountTotal * share);
    const min = Math.min(context.config.transactionDistribution.minIncomeTransactions, Math.max(0, accountTotal - 1));
    const max = accountTotal > 1 ? accountTotal - 1 : accountTotal;
    return clamp(desired, min, max);
}

/**
 * Picks tag IDs for a transaction based on tag distribution rules.
 *
 * @summary Selects tags for transaction seeding.
 */
function pickTransactionTags(context: SeedContext, tags: SelectTag[]): number[] | undefined {
    if (tags.length === 0) {
        return undefined;
    }

    if (!context.random.chance(context.config.transactionDistribution.tagChance)) {
        return undefined;
    }

    const minTags = context.config.transactionDistribution.minTags;
    const maxTags = Math.min(context.config.transactionDistribution.maxTags, tags.length);
    const count = context.random.int(minTags, Math.max(minTags, maxTags));
    const picked = context.random.pickMany(tags, count).map(tag => tag.id);
    return picked.length > 0 ? picked : undefined;
}
