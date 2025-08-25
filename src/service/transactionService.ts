import { TransactionSource, Operator, TableName, TransactionType } from '../utils/enum';
import { DbService } from '../utils/database/services/dbService';
import { DbResponse } from '../utils/database/services/dbResponse';
import { Resource } from '../utils/resources/resource';
import { findWithColumnFilters, countWithColumnFilters } from '../utils/database/helpers/dbHelpers';
import { AccountService } from './accountService';
import { CreditCardService } from './creditCardService';
import { CategoryService } from './categoryService';
import { SubcategoryService } from './subcategoryService';
import Transaction from '../model/transaction/transaction';
import { QueryOptions } from '../utils/pagination';

type TransactionRow = Transaction & {
    account_id: number;
    credit_card_id: number;
    category_id: number | null;
    subcategory_id: number | null;
};

type AccountTransactions = { accountId: number; transactions: TransactionRow[] | undefined };

export class TransactionService extends DbService {
    constructor() {
        super(TableName.TRANSACTION);
    }

    /** @summary Creates a new transaction linked to a valid account.
     * Validates required fields and the existence of the target account.
     *
     * @param data - Transaction creation data.
     * @returns The created transaction record.
     */
    async createTransaction(data: {
        value: number;
        date: Date;
        category_id: number;
        subcategory_id: number;
        observation?: string;
        transactionType: TransactionType;
        transactionSource: TransactionSource;
        isInstallment: boolean;
        totalMonths?: number;
        isRecurring: boolean;
        paymentDay?: number;
        account_id?: number;
        creditCard_id?: number;
        active?: boolean;
    }): Promise<DbResponse<TransactionRow>> {
        if (data.transactionSource === TransactionSource.ACCOUNT) {
            const accountService = new AccountService();
            const account = await accountService.getAccountById(Number(data.account_id));
            if (!account.success || !account.data) {
                return { success: false, error: Resource.ACCOUNT_NOT_FOUND };
            }
        } else {
            const creditCardService = new CreditCardService();
            const card = await creditCardService.getCreditCardById(Number(data.creditCard_id));
            if (!card.success || !card.data) {
                return { success: false, error: Resource.CREDIT_CARD_NOT_FOUND };
            }
        }

        if (!data.category_id && !data.subcategory_id) {
            return { success: false, error: Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED };
        }

        if (data.category_id) {
            const category = await new CategoryService().getCategoryById(data.category_id);
            if (!category.success || !category.data?.active) {
                return { success: false, error: Resource.CATEGORY_NOT_FOUND_OR_INACTIVE };
            }
        }

        if (data.subcategory_id) {
            const subcategory = await new SubcategoryService().getSubcategoryById(data.subcategory_id);
            if (!subcategory.success || !subcategory.data?.active) {
                return { success: false, error: Resource.SUBCATEGORY_NOT_FOUND_OR_INACTIVE };
            }
        }


        const result = await this.create<TransactionRow>(data);
        if (!result.success || !result.data?.id) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }

        return this.findOne<TransactionRow>(result.data.id);
    }

    /** @summary Retrieves all transaction records in the system.
     *
     * @returns A list of all transaction records.
     */
    async getTransactions(options?: QueryOptions<TransactionRow>): Promise<DbResponse<TransactionRow[]>> {
        return findWithColumnFilters<TransactionRow>(TableName.TRANSACTION, {}, {
            orderBy: (options?.sort as keyof TransactionRow) ?? 'date',
            direction: options?.order ?? Operator.DESC,
            limit: options?.limit,
            offset: options?.offset,
        });
    }

    /** @summary Counts all transactions. */
    async countTransactions(): Promise<DbResponse<number>> {
        return countWithColumnFilters<TransactionRow>(TableName.TRANSACTION);
    }

    /** @summary Retrieves a single transaction by its ID.
     *
     * @param id - ID of the transaction.
     * @returns Transaction record if found.
     */
    async getTransactionById(id: number): Promise<DbResponse<TransactionRow>> {
        return this.findOne<TransactionRow>(id);
    }

    /** @summary Retrieves all transactions associated with a specific account.
     *
     * @param accountId - ID of the account.
     * @returns A list of transactions linked to the account.
     */
    async getTransactionsByAccount(accountId: number, options?: QueryOptions<TransactionRow>): Promise<DbResponse<TransactionRow[]>> {
        return findWithColumnFilters<TransactionRow>(TableName.TRANSACTION, {
            account_id: { operator: Operator.EQUAL, value: accountId }
        }, {
            orderBy: (options?.sort as keyof TransactionRow) ?? 'date',
            direction: options?.order ?? Operator.DESC,
            limit: options?.limit,
            offset: options?.offset,
        });
    }

    /** @summary Counts transactions for a specific account. */
    async countTransactionsByAccount(accountId: number): Promise<DbResponse<number>> {
        return countWithColumnFilters<TransactionRow>(TableName.TRANSACTION, {
            account_id: { operator: Operator.EQUAL, value: accountId }
        });
    }

    /** @summary Retrieves all transactions for a given user, grouped by their accounts.
     *
     * @param userId - ID of the user.
     * @returns A list of grouped transactions by account.
     */
    async getTransactionsByUser(userId: number, options?: QueryOptions<TransactionRow>): Promise<DbResponse<AccountTransactions[]>> {
        const accountService = new AccountService();
        const userAccounts = await accountService.getAccountsByUser(userId);

        if (!userAccounts.success || !userAccounts.data?.length) {
            return { success: false, error: Resource.ACCOUNT_NOT_FOUND };
        }

        const accountIds = userAccounts.data.map(acc => acc.id);

        const allTransactions = await findWithColumnFilters<TransactionRow>(
            TableName.TRANSACTION,
            { account_id: { operator: Operator.IN, value: accountIds } },
            {
                orderBy: (options?.sort as keyof TransactionRow) ?? 'date',
                direction: options?.order ?? Operator.DESC,
                limit: options?.limit,
                offset: options?.offset,
            }
        );

        if (!allTransactions.success || !allTransactions.data) {
            return { ...allTransactions, data: undefined } as DbResponse<AccountTransactions[]>;
        }

        const grouped: AccountTransactions[] = accountIds.map(accountId => ({
            accountId,
            transactions: allTransactions.data?.filter(e => e.account_id === accountId)
        }));

        return {
            success: true,
            data: grouped
        };
    }

    /** @summary Counts transactions across all accounts for a specific user. */
    async countTransactionsByUser(userId: number): Promise<DbResponse<number>> {
        const accountService = new AccountService();
        const userAccounts = await accountService.getAccountsByUser(userId);

        if (!userAccounts.success || !userAccounts.data?.length) {
            return { success: false, error: Resource.ACCOUNT_NOT_FOUND };
        }

        const accountIds = userAccounts.data.map(acc => acc.id);

        return countWithColumnFilters<TransactionRow>(TableName.TRANSACTION, {
            account_id: { operator: Operator.IN, value: accountIds }
        });
    }

    /** @summary Updates an transaction by ID.
     *
     * @param id - ID of the transaction.
     * @param data - Partial transaction data to update.
     * @returns Updated transaction record.
     */
    async updateTransaction(id: number, data: Partial<TransactionRow>): Promise<DbResponse<TransactionRow>> {
        const current = await this.findOne<TransactionRow>(id);
        if (!current.success || !current.data) {
            return { success: false, error: Resource.TRANSACTION_NOT_FOUND };
        }

        const effectiveSource = data.transactionSource !== undefined ? data.transactionSource : current.data.transactionSource;

        if (effectiveSource === TransactionSource.ACCOUNT) {
            const accId = data.account_id !== undefined ? data.account_id : current.data.account_id;
            const account = await new AccountService().getAccountById(Number(accId));
            if (!account.success || !account.data) {
                return { success: false, error: Resource.ACCOUNT_NOT_FOUND };
            }
            if (data.credit_card_id !== undefined) {
                (data as any).credit_card_id = null;
            }
        } else {
            const cardId = data.credit_card_id !== undefined ? data.credit_card_id : current.data.credit_card_id;
            const card = await new CreditCardService().getCreditCardById(Number(cardId));
            if (!card.success || !card.data) {
                return { success: false, error: Resource.CREDIT_CARD_NOT_FOUND };
            }
            if (data.account_id !== undefined) {
                (data as any).account_id = null;
            }
        }

        const effectiveCategoryId = data.category_id !== undefined ? data.category_id : current.data.category_id;
        const effectiveSubcategoryId = data.subcategory_id !== undefined ? data.subcategory_id : current.data.subcategory_id;

        if (!effectiveCategoryId && !effectiveSubcategoryId) {
            return { success: false, error: Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED };
        }

        if (data.category_id !== undefined) {
            const category = await new CategoryService().getCategoryById(Number(data.category_id));
            if (!category.success || !category.data?.active) {
                return { success: false, error: Resource.CATEGORY_NOT_FOUND_OR_INACTIVE };
            }
        }

        if (data.subcategory_id !== undefined) {
            const subcategory = await new SubcategoryService().getSubcategoryById(Number(data.subcategory_id));
            if (!subcategory.success || !subcategory.data?.active) {
                return { success: false, error: Resource.SUBCATEGORY_NOT_FOUND_OR_INACTIVE };
            }
        }

        const updateResult = await this.update<TransactionRow>(id, data);
        if (!updateResult.success) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }

        return this.findOne<TransactionRow>(id);
    }


    /**
     * Deletes an transaction by ID after verifying its existence.
     *
     * @param id - ID of the transaction to delete.
     * @returns  Success with deleted ID, or error if transaction does not exist.
     */
    async deleteTransaction(id: number): Promise<DbResponse<{ id: number }>> {
        const existing = await this.findOne<TransactionRow>(id);

        if (!existing.success) {
            return { success: false, error: Resource.TRANSACTION_NOT_FOUND };
        }

        return this.remove(id);
    }
}
