import { TransactionSource, Operator, TransactionType } from '../utils/enum';
import { TransactionRepository } from '../repositories/transactionRepository';
import { AccountService } from './accountService';
import { CreditCardService } from './creditCardService';
import { CategoryService } from './categoryService';
import { SubcategoryService } from './subcategoryService';
import { Resource } from '../utils/resources/resource';
import { SelectTransaction, InsertTransaction } from '../db/schema';
import { QueryOptions } from '../utils/pagination';

export type TransactionRow = SelectTransaction;
type AccountTransactions = { accountId: number; transactions: TransactionRow[] | undefined };

/**
 * Service for transaction business logic.
 * Handles transaction operations including validation and account/card linking.
 */
export class TransactionService {
    private transactionRepository: TransactionRepository;

    constructor() {
        this.transactionRepository = new TransactionRepository();
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
        active?: boolean;
    }): Promise<{ success: true; data: SelectTransaction } | { success: false; error: Resource }> {
        if (data.transactionSource === TransactionSource.ACCOUNT) {
            const accountService = new AccountService();
            const account = await accountService.getAccountById(Number(data.accountId));
            if (!account.success || !account.data) {
                return { success: false, error: Resource.ACCOUNT_NOT_FOUND };
            }
        } else {
            const creditCardService = new CreditCardService();
            const card = await creditCardService.getCreditCardById(Number(data.creditCardId));
            if (!card.success || !card.data) {
                return { success: false, error: Resource.CREDIT_CARD_NOT_FOUND };
            }
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
            } as InsertTransaction);
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
    async getTransactions(options?: QueryOptions<SelectTransaction>): Promise<{ success: true; data: SelectTransaction[] } | { success: false; error: Resource }> {
        try {
            const transactions = await this.transactionRepository.findMany(undefined, {
                limit: options?.limit,
                offset: options?.offset,
                sort: (options?.sort as keyof SelectTransaction) || 'date',
                order: options?.order === Operator.DESC ? 'desc' : 'asc',
            });
            return { success: true, data: transactions };
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
    async countTransactions(): Promise<{ success: true; data: number } | { success: false; error: Resource }> {
        try {
            const count = await this.transactionRepository.count();
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
    async getTransactionById(id: number): Promise<{ success: true; data: SelectTransaction } | { success: false; error: Resource }> {
        const transaction = await this.transactionRepository.findById(id);
        if (!transaction) {
            return { success: false, error: Resource.NO_RECORDS_FOUND };
        }
        return { success: true, data: transaction };
    }

    /**
     * Retrieves all transactions associated with a specific account.
     *
     * @summary Gets all transactions for an account.
     * @param accountId - ID of the account.
     * @returns A list of transactions linked to the account.
     */
    async getTransactionsByAccount(accountId: number, options?: QueryOptions<SelectTransaction>): Promise<{ success: true; data: SelectTransaction[] } | { success: false; error: Resource }> {
        try {
            const transactions = await this.transactionRepository.findMany({
                accountId: { operator: Operator.EQUAL, value: accountId }
            }, {
                limit: options?.limit,
                offset: options?.offset,
                sort: (options?.sort as keyof SelectTransaction) || 'date',
                order: options?.order === Operator.DESC ? 'desc' : 'asc',
            });
            return { success: true, data: transactions };
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

            const grouped: AccountTransactions[] = accountIds.map(accountId => ({
                accountId,
                transactions: allTransactions.filter(t => t.accountId === accountId)
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
    async updateTransaction(id: number, data: Partial<InsertTransaction>): Promise<{ success: true; data: SelectTransaction } | { success: false; error: Resource }> {
        const current = await this.transactionRepository.findById(id);
        if (!current) {
            return { success: false, error: Resource.TRANSACTION_NOT_FOUND };
        }

        const effectiveSource = data.transactionSource !== undefined ? data.transactionSource : current.transactionSource;

        if (effectiveSource === TransactionSource.ACCOUNT) {
            const accId = data.accountId !== undefined ? data.accountId : current.accountId;
            const account = await new AccountService().getAccountById(Number(accId));
            if (!account.success || !account.data) {
                return { success: false, error: Resource.ACCOUNT_NOT_FOUND };
            }
            if (data.creditCardId !== undefined) {
                data.creditCardId = null;
            }
        } else {
            const cardId = data.creditCardId !== undefined ? data.creditCardId : current.creditCardId;
            const card = await new CreditCardService().getCreditCardById(Number(cardId));
            if (!card.success || !card.data) {
                return { success: false, error: Resource.CREDIT_CARD_NOT_FOUND };
            }
            if (data.accountId !== undefined) {
                data.accountId = null;
            }
        }

        const effectiveCategoryId = data.categoryId !== undefined ? data.categoryId : current.categoryId;
        const effectiveSubcategoryId = data.subcategoryId !== undefined ? data.subcategoryId : current.subcategoryId;

        if (!effectiveCategoryId && !effectiveSubcategoryId) {
            return { success: false, error: Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED };
        }

        if (data.categoryId !== undefined) {
            const category = await new CategoryService().getCategoryById(Number(data.categoryId));
            if (!category.success || !category.data?.active) {
                return { success: false, error: Resource.CATEGORY_NOT_FOUND_OR_INACTIVE };
            }
        }

        if (data.subcategoryId !== undefined) {
            const subcategory = await new SubcategoryService().getSubcategoryById(Number(data.subcategoryId));
            if (!subcategory.success || !subcategory.data?.active) {
                return { success: false, error: Resource.SUBCATEGORY_NOT_FOUND_OR_INACTIVE };
            }
        }

        try {
            const updated = await this.transactionRepository.update(id, data);
            return { success: true, data: updated };
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
            await this.transactionRepository.delete(id);
            return { success: true, data: { id } };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }
}
