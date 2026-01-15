import { eq, inArray } from 'drizzle-orm';
import { TransactionSource, Operator, TransactionType } from '../utils/enum';
import { TransactionRepository } from '../repositories/transactionRepository';
import { AccountRepository } from '../repositories/accountRepository';
import { CreditCardRepository } from '../repositories/creditCardRepository';
import { TagRepository } from '../repositories/tagRepository';
import { AccountService } from './accountService';
import { CreditCardService } from './creditCardService';
import { CategoryService } from './categoryService';
import { SubcategoryService } from './subcategoryService';
import { Resource } from '../utils/resources/resource';
import { SelectTransaction, InsertTransaction, InsertAccount, InsertCreditCard, transactionTags } from '../db/schema';
import { QueryOptions } from '../utils/pagination';
import { withTransaction, db } from '../db';

export type TransactionWithTags = SelectTransaction & { tags: number[] };
export type TransactionRow = TransactionWithTags;
type AccountTransactions = { accountId: number; transactions: TransactionRow[] | undefined };
type TransactionFilters = {
    accountId?: { operator: Operator.EQUAL | Operator.IN; value: number | number[] };
    creditCardId?: { operator: Operator.EQUAL | Operator.IN; value: number | number[] };
    categoryId?: { operator: Operator.EQUAL | Operator.IN; value: number | number[] };
    subcategoryId?: { operator: Operator.EQUAL | Operator.IN; value: number | number[] };
    tagIds?: { operator: Operator.IN; value: number[] };
    transactionType?: { operator: Operator.EQUAL | Operator.IN; value: TransactionType | TransactionType[] };
    transactionSource?: { operator: Operator.EQUAL | Operator.IN; value: TransactionSource | TransactionSource[] };
    active?: { operator: Operator.EQUAL; value: boolean };
    date?: { operator: Operator.BETWEEN; value: [Date | null, Date | null] };
};
type TransactionCountFilters = TransactionFilters;

/**
 * Service for transaction business logic.
 * Handles transaction operations including validation and account/card linking.
 */
export class TransactionService {
    private transactionRepository: TransactionRepository;
    private accountRepository: AccountRepository;
    private creditCardRepository: CreditCardRepository;
    private tagRepository: TagRepository;

    constructor() {
        this.transactionRepository = new TransactionRepository();
        this.accountRepository = new AccountRepository();
        this.creditCardRepository = new CreditCardRepository();
        this.tagRepository = new TagRepository();
    }

    private normalizeTagIds(tags?: number[]): number[] | undefined {
        if (!tags) return undefined;
        const unique = new Set(tags);
        return Array.from(unique);
    }

    private normalizeAmount(value: string | number | null | undefined): number {
        if (value === null || value === undefined) return 0;
        const parsed = typeof value === 'number' ? value : Number(value);
        return Number.isNaN(parsed) ? 0 : parsed;
    }

    private formatAmount(value: number): string {
        const rounded = Math.round(value * 100) / 100;
        return rounded.toFixed(2);
    }

    private getSignedAmount(transactionType: SelectTransaction['transactionType'], source: SelectTransaction['transactionSource'], value: string | number): number {
        const amount = this.normalizeAmount(value);
        if (source === TransactionSource.ACCOUNT) {
            return transactionType === TransactionType.INCOME ? amount : -amount;
        }
        return transactionType === TransactionType.EXPENSE ? amount : -amount;
    }

    private async applyBalanceDelta(
        connection: typeof db,
        transaction: SelectTransaction,
        delta: number
    ): Promise<void> {
        if (!delta) return;

        if (transaction.transactionSource === TransactionSource.ACCOUNT) {
            if (!transaction.accountId) {
                throw new Error('BalanceInvariantViolation: accountId required.');
            }
            const account = await this.accountRepository.findById(transaction.accountId, connection);
            if (!account) {
                throw new Error('BalanceInvariantViolation: account not found.');
            }
            const nextBalance = this.normalizeAmount(account.balance) + delta;
            await this.accountRepository.update(
                transaction.accountId,
                { balance: this.formatAmount(nextBalance) } as Partial<InsertAccount>,
                connection
            );
            return;
        }

        if (!transaction.creditCardId) {
            throw new Error('BalanceInvariantViolation: creditCardId required.');
        }
        const card = await this.creditCardRepository.findById(transaction.creditCardId, connection);
        if (!card) {
            throw new Error('BalanceInvariantViolation: credit card not found.');
        }
        const nextBalance = this.normalizeAmount(card.balance) + delta;
        await this.creditCardRepository.update(
            transaction.creditCardId,
            { balance: this.formatAmount(nextBalance) } as Partial<InsertCreditCard>,
            connection
        );
    }

    private async applyBalanceUpdate(
        connection: typeof db,
        current: SelectTransaction,
        updated: SelectTransaction
    ): Promise<void> {
        const currentDelta = this.getSignedAmount(current.transactionType, current.transactionSource, current.value);
        const updatedDelta = this.getSignedAmount(updated.transactionType, updated.transactionSource, updated.value);

        const sameSource = current.transactionSource === updated.transactionSource;
        const sameAccount = current.accountId === updated.accountId;
        const sameCard = current.creditCardId === updated.creditCardId;

        if (sameSource && ((current.transactionSource === TransactionSource.ACCOUNT && sameAccount) || (current.transactionSource === TransactionSource.CREDIT_CARD && sameCard))) {
            const diff = updatedDelta - currentDelta;
            if (diff !== 0) {
                await this.applyBalanceDelta(connection, updated, diff);
            }
            return;
        }

        await this.applyBalanceDelta(connection, current, -currentDelta);
        await this.applyBalanceDelta(connection, updated, updatedDelta);
    }

    private async validateTagsByUser(userId: number, tagIds: number[]): Promise<boolean> {
        if (tagIds.length === 0) return true;

        const existing = await this.tagRepository.findMany({
            id: { operator: Operator.IN, value: tagIds },
            userId: { operator: Operator.EQUAL, value: userId },
            active: { operator: Operator.EQUAL, value: true },
        });

        return existing.length === tagIds.length;
    }

    private async replaceTransactionTags(
        connection: typeof db,
        transactionId: number,
        tagIds: number[]
    ): Promise<void> {
        await connection.delete(transactionTags).where(eq(transactionTags.transactionId, transactionId));

        if (tagIds.length === 0) return;

        await connection.insert(transactionTags).values(
            tagIds.map(tagId => ({
                transactionId,
                tagId,
            }))
        );
    }

    private async attachTags(
        transactions: SelectTransaction[],
        connection: typeof db = db
    ): Promise<TransactionWithTags[]> {
        if (!transactions.length) {
            return [];
        }

        const transactionIds = transactions.map(transaction => transaction.id);
        const tagRows = await connection
            .select()
            .from(transactionTags)
            .where(inArray(transactionTags.transactionId, transactionIds));

        const tagMap = new Map<number, number[]>();
        for (const row of tagRows) {
            const existing = tagMap.get(row.transactionId) ?? [];
            existing.push(row.tagId);
            tagMap.set(row.transactionId, existing);
        }

        return transactions.map(transaction => ({
            ...transaction,
            tags: tagMap.get(transaction.id) ?? [],
        }));
    }

    /**
     * Creates a new transaction linked to a valid account.
     * Validates required fields and the existence of the target account.
     *
     * @summary Creates a new transaction.
     * @param data - Transaction creation data.
     * @returns The created transaction record.
     */
    async createTransaction(data: {
        value: number;
        date: Date;
        categoryId?: number;
        subcategoryId?: number;
        observation?: string;
        transactionType: TransactionType;
        transactionSource: TransactionSource;
        isInstallment: boolean;
        totalMonths?: number;
        isRecurring: boolean;
        paymentDay?: number;
        accountId?: number;
        creditCardId?: number;
        tags?: number[];
        active?: boolean;
    }): Promise<{ success: true; data: TransactionWithTags } | { success: false; error: Resource }> {
        let ownerUserId: number | undefined;

        if (data.transactionSource === TransactionSource.ACCOUNT) {
            const accountService = new AccountService();
            const account = await accountService.getAccountById(Number(data.accountId));
            if (!account.success || !account.data) {
                return { success: false, error: Resource.ACCOUNT_NOT_FOUND };
            }
            ownerUserId = account.data.userId;
        } else {
            const creditCardService = new CreditCardService();
            const card = await creditCardService.getCreditCardById(Number(data.creditCardId));
            if (!card.success || !card.data) {
                return { success: false, error: Resource.CREDIT_CARD_NOT_FOUND };
            }
            ownerUserId = card.data.userId;
        }

        if (!data.categoryId && !data.subcategoryId) {
            return { success: false, error: Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED };
        }

        if (data.categoryId) {
            const category = await new CategoryService().getCategoryById(data.categoryId);
            if (!category.success || !category.data?.active) {
                return { success: false, error: Resource.CATEGORY_NOT_FOUND_OR_INACTIVE };
            }
        }

        if (data.subcategoryId) {
            const subcategory = await new SubcategoryService().getSubcategoryById(data.subcategoryId);
            if (!subcategory.success || !subcategory.data?.active) {
                return { success: false, error: Resource.SUBCATEGORY_NOT_FOUND_OR_INACTIVE };
            }
        }

        try {
            const tagIds = this.normalizeTagIds(data.tags);
            if (tagIds && ownerUserId !== undefined) {
                const isValid = await this.validateTagsByUser(ownerUserId, tagIds);
                if (!isValid) {
                    return { success: false, error: Resource.TAG_NOT_FOUND };
                }
            }

            const created = await withTransaction(async (connection) => {
                const created = await this.transactionRepository.create({
                    value: data.value.toString(),
                    date: data.date,
                    transactionType: data.transactionType,
                    transactionSource: data.transactionSource,
                    isInstallment: data.isInstallment,
                    totalMonths: data.totalMonths,
                    isRecurring: data.isRecurring,
                    paymentDay: data.paymentDay,
                    active: data.active,
                    observation: data.observation,
                    accountId: data.accountId,
                    creditCardId: data.creditCardId,
                    categoryId: data.categoryId,
                    subcategoryId: data.subcategoryId,
                } as InsertTransaction, connection);

                const delta = this.getSignedAmount(data.transactionType, data.transactionSource, data.value);
                await this.applyBalanceDelta(connection, created, delta);

                if (tagIds) {
                    await this.replaceTransactionTags(connection, created.id, tagIds);
                }

                return { ...created, tags: tagIds ?? [] };
            });
            return { success: true, data: created };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Retrieves all transaction records in the system.
     *
     * @summary Gets all transactions with optional pagination and sorting.
     * @param options - Query options for pagination and sorting.
     * @returns A list of all transaction records.
     */
    async getTransactions(
        filters?: TransactionFilters,
        options?: QueryOptions<SelectTransaction>
    ): Promise<{ success: true; data: TransactionWithTags[] } | { success: false; error: Resource }> {
        try {
            const transactions = await this.transactionRepository.findMany(filters, {
                limit: options?.limit,
                offset: options?.offset,
                sort: (options?.sort as keyof SelectTransaction) || 'date',
                order: options?.order === Operator.DESC ? 'desc' : 'asc',
            });
            const withTags = await this.attachTags(transactions);
            return { success: true, data: withTags };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Counts all transactions.
     *
     * @summary Gets total count of transactions.
     * @returns Total transaction count.
     */
    async countTransactions(filters?: TransactionCountFilters): Promise<{ success: true; data: number } | { success: false; error: Resource }> {
        try {
            const count = await this.transactionRepository.count(filters);
            return { success: true, data: count };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Retrieves a single transaction by its ID.
     *
     * @summary Gets a transaction by ID.
     * @param id - ID of the transaction.
     * @returns Transaction record if found.
     */
    async getTransactionById(id: number): Promise<{ success: true; data: TransactionWithTags } | { success: false; error: Resource }> {
        const transaction = await this.transactionRepository.findById(id);
        if (!transaction) {
            return { success: false, error: Resource.NO_RECORDS_FOUND };
        }
        const [withTags] = await this.attachTags([transaction]);
        return { success: true, data: withTags };
    }

    /**
     * Retrieves all transactions associated with a specific account.
     *
     * @summary Gets all transactions for an account.
     * @param accountId - ID of the account.
     * @returns A list of transactions linked to the account.
     */
    async getTransactionsByAccount(accountId: number, options?: QueryOptions<SelectTransaction>): Promise<{ success: true; data: TransactionWithTags[] } | { success: false; error: Resource }> {
        try {
            const transactions = await this.transactionRepository.findMany({
                accountId: { operator: Operator.EQUAL, value: accountId }
            }, {
                limit: options?.limit,
                offset: options?.offset,
                sort: (options?.sort as keyof SelectTransaction) || 'date',
                order: options?.order === Operator.DESC ? 'desc' : 'asc',
            });
            const withTags = await this.attachTags(transactions);
            return { success: true, data: withTags };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Counts transactions for a specific account.
     *
     * @summary Gets count of transactions for an account.
     * @param accountId - Account ID.
     * @returns Count of transactions.
     */
    async countTransactionsByAccount(accountId: number): Promise<{ success: true; data: number } | { success: false; error: Resource }> {
        try {
            const count = await this.transactionRepository.count({
                accountId: { operator: Operator.EQUAL, value: accountId }
            });
            return { success: true, data: count };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Retrieves all transactions for a given user, grouped by their accounts.
     *
     * @summary Gets all transactions for a user grouped by account.
     * @param userId - ID of the user.
     * @returns A list of grouped transactions by account.
     */
    async getTransactionsByUser(userId: number, options?: QueryOptions<SelectTransaction>): Promise<{ success: true; data: AccountTransactions[] } | { success: false; error: Resource }> {
        const accountService = new AccountService();
        const userAccounts = await accountService.getAccountsByUser(userId);

        if (!userAccounts.success || !userAccounts.data?.length) {
            return { success: false, error: Resource.ACCOUNT_NOT_FOUND };
        }

        const accountIds = userAccounts.data.map(acc => acc.id);

        try {
            const allTransactions = await this.transactionRepository.findMany({
                accountId: { operator: Operator.IN, value: accountIds }
            }, {
                limit: options?.limit,
                offset: options?.offset,
                sort: (options?.sort as keyof SelectTransaction) || 'date',
                order: options?.order === Operator.DESC ? 'desc' : 'asc',
            });

            const transactionsWithTags = await this.attachTags(allTransactions);
            const grouped: AccountTransactions[] = accountIds.map(accountId => ({
                accountId,
                transactions: transactionsWithTags.filter(t => t.accountId === accountId)
            }));

            return { success: true, data: grouped };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Counts transactions across all accounts for a specific user.
     *
     * @summary Gets count of transactions for a user.
     * @param userId - User ID.
     * @returns Count of transactions.
     */
    async countTransactionsByUser(userId: number): Promise<{ success: true; data: number } | { success: false; error: Resource }> {
        const accountService = new AccountService();
        const userAccounts = await accountService.getAccountsByUser(userId);

        if (!userAccounts.success || !userAccounts.data?.length) {
            return { success: false, error: Resource.ACCOUNT_NOT_FOUND };
        }

        const accountIds = userAccounts.data.map(acc => acc.id);

        try {
            const count = await this.transactionRepository.count({
                accountId: { operator: Operator.IN, value: accountIds }
            });
            return { success: true, data: count };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Updates a transaction by ID.
     *
     * @summary Updates transaction data.
     * @param id - ID of the transaction.
     * @param data - Partial transaction data to update.
     * @returns Updated transaction record.
     */
    async updateTransaction(id: number, data: Partial<InsertTransaction> & { tags?: number[] }): Promise<{ success: true; data: TransactionWithTags } | { success: false; error: Resource }> {
        const current = await this.transactionRepository.findById(id);
        if (!current) {
            return { success: false, error: Resource.TRANSACTION_NOT_FOUND };
        }

        const { tags, ...updateData } = data;
        let ownerUserId: number | undefined;
        const effectiveSource = updateData.transactionSource !== undefined ? updateData.transactionSource : current.transactionSource;

        if (effectiveSource === TransactionSource.ACCOUNT) {
            const accId = updateData.accountId !== undefined ? updateData.accountId : current.accountId;
            const account = await new AccountService().getAccountById(Number(accId));
            if (!account.success || !account.data) {
                return { success: false, error: Resource.ACCOUNT_NOT_FOUND };
            }
            ownerUserId = account.data.userId;
            if (updateData.creditCardId !== undefined) {
                updateData.creditCardId = null;
            }
        } else {
            const cardId = updateData.creditCardId !== undefined ? updateData.creditCardId : current.creditCardId;
            const card = await new CreditCardService().getCreditCardById(Number(cardId));
            if (!card.success || !card.data) {
                return { success: false, error: Resource.CREDIT_CARD_NOT_FOUND };
            }
            ownerUserId = card.data.userId;
            if (updateData.accountId !== undefined) {
                updateData.accountId = null;
            }
        }

        if (updateData.categoryId === undefined && updateData.subcategoryId === undefined) {
            return { success: false, error: Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED };
        }

        const effectiveCategoryId = updateData.categoryId !== undefined ? updateData.categoryId : current.categoryId;
        const effectiveSubcategoryId = updateData.subcategoryId !== undefined ? updateData.subcategoryId : current.subcategoryId;

        if (!effectiveCategoryId && !effectiveSubcategoryId) {
            return { success: false, error: Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED };
        }

        if (updateData.categoryId !== undefined) {
            const category = await new CategoryService().getCategoryById(Number(updateData.categoryId));
            if (!category.success || !category.data?.active) {
                return { success: false, error: Resource.CATEGORY_NOT_FOUND_OR_INACTIVE };
            }
        }

        if (updateData.subcategoryId !== undefined) {
            const subcategory = await new SubcategoryService().getSubcategoryById(Number(updateData.subcategoryId));
            if (!subcategory.success || !subcategory.data?.active) {
                return { success: false, error: Resource.SUBCATEGORY_NOT_FOUND_OR_INACTIVE };
            }
        }

        try {
            const tagIds = this.normalizeTagIds(tags);
            if (tagIds && ownerUserId !== undefined) {
                const isValid = await this.validateTagsByUser(ownerUserId, tagIds);
                if (!isValid) {
                    return { success: false, error: Resource.TAG_NOT_FOUND };
                }
            }

            const updated = await withTransaction(async (connection) => {
                const updated = await this.transactionRepository.update(id, updateData, connection);
                await this.applyBalanceUpdate(connection, current, updated);
                if (tagIds) {
                    await this.replaceTransactionTags(connection, updated.id, tagIds);
                }
                return updated;
            });
            const [withTags] = await this.attachTags([updated]);
            return { success: true, data: withTags };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Deletes a transaction by ID after verifying its existence.
     *
     * @summary Removes a transaction from the database.
     * @param id - ID of the transaction to delete.
     * @returns Success with deleted ID, or error if transaction does not exist.
     */
    async deleteTransaction(id: number): Promise<{ success: true; data: { id: number } } | { success: false; error: Resource }> {
        const existing = await this.transactionRepository.findById(id);
        if (!existing) {
            return { success: false, error: Resource.TRANSACTION_NOT_FOUND };
        }

        try {
            await withTransaction(async (connection) => {
                await this.transactionRepository.delete(id, connection);
                await connection.delete(transactionTags).where(eq(transactionTags.transactionId, id));
                const delta = -this.getSignedAmount(existing.transactionType, existing.transactionSource, existing.value);
                await this.applyBalanceDelta(connection, existing, delta);
            });
            return { success: true, data: { id } };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }
}
