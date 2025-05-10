import { ExpenseType, Operator, TableName } from '../utils/enum';
import { DbService } from '../utils/database/services/dbService';
import { DbResponse } from '../utils/database/services/dbResponse';
import { Resource } from '../utils/resources/resource';
import { findWithColumnFilters } from '../utils/database/helpers/dbHelpers';
import { AccountService } from './accountService';

export class ExpenseService extends DbService {
    constructor() {
        super(TableName.EXPENSE);
    }

    /**
     * Creates a new expense linked to a valid account.
     * Validates required fields and the existence of the target account.
     *
     * @param data - Expense creation data.
     * @returns The created expense record.
     */
    async createExpense(data: {
        value: number;
        date: Date;
        category: string;
        subcategory: string;
        observation?: string;
        expenseType: ExpenseType
        isInstallment: boolean;
        totalMonths?: number;
        isRecurring: boolean;
        paymentDay?: number;
        account_id: number;
        active?: boolean;
    }): Promise<DbResponse<any>> {
        const accountService = new AccountService();
        const account = await accountService.getAccountById(data.account_id);

        if (!account.success || !account.data) {
            return { success: false, error: Resource.ACCOUNT_NOT_FOUND };
        }

        return this.create(data);
    }

    /**
     * Retrieves all expense records in the system.
     *
     * @returns A list of all expense records.
     */
    async getExpenses(): Promise<DbResponse<any[]>> {
        return findWithColumnFilters<any>(TableName.EXPENSE, {}, {
            orderBy: 'date',
            direction: Operator.DESC
        });
    }

    /**
     * Retrieves a single expense by its ID.
     *
     * @param id - ID of the expense.
     * @returns Expense record if found.
     */
    async getExpenseById(id: number): Promise<DbResponse<any>> {
        return this.findOne(id);
    }

    /**
     * Retrieves all expenses associated with a specific account.
     *
     * @param accountId - ID of the account.
     * @returns A list of expenses linked to the account.
     */
    async getExpensesByAccount(accountId: number): Promise<DbResponse<any[]>> {
        return findWithColumnFilters<any>(TableName.EXPENSE, {
            account_id: { operator: Operator.EQUAL, value: accountId }
        }, { orderBy: 'date', direction: Operator.DESC });
    }

    /**
     * Retrieves all expenses for a given user, grouped by their accounts.
     *
     * @param userId - ID of the user.
     * @returns A list of grouped expenses by account.
     */
    async getExpensesByUser(userId: number): Promise<DbResponse<any[]>> {
        const accountService = new AccountService();
        const userAccounts = await accountService.getAccountsByUser(userId);

        if (!userAccounts.success || !userAccounts.data?.length) {
            return { success: false, error: Resource.NO_ACCOUNTS_FOUND };
        }

        const accountIds = userAccounts.data.map(acc => acc.id);

        const allExpenses = await findWithColumnFilters<any>(
            TableName.EXPENSE,
            { account_id: { operator: Operator.IN, value: accountIds } },
            { orderBy: 'date', direction: Operator.DESC }
        );

        if (!allExpenses.success || !allExpenses.data) {
            return allExpenses;
        }

        // Agrupando manualmente por account_id
        const grouped = accountIds.map(accountId => ({
            accountId,
            expenses: allExpenses.data?.filter(e => e.account_id === accountId)
        }));

        return {
            success: true,
            data: grouped
        };
    }


    /**
     * Updates an expense by ID.
     *
     * @param id - ID of the expense.
     * @param data - Partial expense data to update.
     * @returns Updated expense record.
     */
    async updateExpense(id: number, data: Partial<any>): Promise<DbResponse<any>> {
        await this.update(id, data);
        return this.findOne(id);
    }

    /**
     * Deletes an expense by ID after verifying its existence.
     *
     * @param id - ID of the expense to delete.
     * @returns Success with deleted ID, or error if not found.
     */
    async deleteExpense(id: number): Promise<DbResponse<{ id: number }>> {
        const existing = await this.findOne(id);

        if (!existing.success) {
            return { success: false, error: Resource.EXPENSE_NOT_FOUND };
        }

        return this.remove(id);
    }
}
