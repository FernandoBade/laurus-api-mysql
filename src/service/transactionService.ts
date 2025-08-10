import { TransactionSource, Operator, TableName } from '../utils/enum';
import { DbService } from '../utils/database/services/dbService';
import { DbResponse } from '../utils/database/services/dbResponse';
import { Resource } from '../utils/resources/resource';
import { findWithColumnFilters } from '../utils/database/helpers/dbHelpers';
import { AccountService } from './accountService';
import { CategoryService } from './categoryService';
import { SubcategoryService } from './subcategoryService';
import Transaction from '../model/transaction/transaction';

type TransactionRow = Transaction & {
    account_id: number;
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
        transactionType: TransactionSource;
        isInstallment: boolean;
        totalMonths?: number;
        isRecurring: boolean;
        paymentDay?: number;
        account_id: number;
        active?: boolean;
    }): Promise<DbResponse<TransactionRow>> {
        const accountService = new AccountService();
        const account = await accountService.getAccountById(data.account_id);

        if (!account.success || !account.data) {
            return { success: false, error: Resource.ACCOUNT_NOT_FOUND };
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
    async getTransactions(): Promise<DbResponse<TransactionRow[]>> {
        return findWithColumnFilters<TransactionRow>(TableName.TRANSACTION, {}, {
            orderBy: 'date',
            direction: Operator.DESC
        });
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
    async getTransactionsByAccount(accountId: number): Promise<DbResponse<TransactionRow[]>> {
        return findWithColumnFilters<TransactionRow>(TableName.TRANSACTION, {
            account_id: { operator: Operator.EQUAL, value: accountId }
        }, { orderBy: 'date', direction: Operator.DESC });
    }

    /** @summary Retrieves all transactions for a given user, grouped by their accounts.
     *
     * @param userId - ID of the user.
     * @returns A list of grouped transactions by account.
     */
    async getTransactionsByUser(userId: number): Promise<DbResponse<AccountTransactions[]>> {
        const accountService = new AccountService();
        const userAccounts = await accountService.getAccountsByUser(userId);

        if (!userAccounts.success || !userAccounts.data?.length) {
            return { success: false, error: Resource.ACCOUNT_NOT_FOUND };
        }

        const accountIds = userAccounts.data.map(acc => acc.id);

        const allTransactions = await findWithColumnFilters<TransactionRow>(
            TableName.TRANSACTION,
            { account_id: { operator: Operator.IN, value: accountIds } },
            { orderBy: 'date', direction: Operator.DESC }
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

        if (data.account_id !== undefined) {
            const account = await new AccountService().getAccountById(Number(data.account_id));
            if (!account.success || !account.data) {
                return { success: false, error: Resource.ACCOUNT_NOT_FOUND };
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
