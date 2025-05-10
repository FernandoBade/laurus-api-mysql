import { Operator, TableName } from '../utils/enum';
import { DbService } from '../utils/database/services/dbService';
import { DbResponse } from '../utils/database/services/dbResponse';
import { Resource } from '../utils/resources/resource';
import { findWithColumnFilters } from '../utils/database/helpers/dbHelpers';
import { UserService } from './userService';

export class AccountService extends DbService {
    constructor() {
        super(TableName.ACCOUNT);
    }

    /**
     * Creates a new financial account.
     * Ensures the required data is present and linked to a valid user.
     *
     * @param data - Account creation data.
     * @returns The created account record.
     */
    async createAccount(data: {
        name: string;
        institution: string;
        type: string;
        observation?: string;
        user_id: number;
        active?: boolean;
    }): Promise<DbResponse<any>> {
        const userService = new UserService();
        const user = await userService.getUserById(data.user_id);

        if (!user.success || !user.data) {
            return { success: false, error: Resource.USER_NOT_FOUND };
        }

        return this.create(data);
    }

    /**
     * Retrieves all financial accounts from the database.
     *
     * @returns A list of all account records.
     */
    async getAccounts(): Promise<DbResponse<any[]>> {
        return this.findMany<any>();
    }

    /**
     * Retrieves a single account by its ID.
     *
     * @param id - ID of the account.
     * @returns Account record if found.
     */
    async getAccountById(id: number): Promise<DbResponse<any>> {
        return this.findOne(id);
    }

    /**
     * Retrieves all accounts associated with a given user ID.
     *
     * @param userId - ID of the user.
     * @returns A list of accounts owned by the user.
     */
    async getAccountsByUser(userId: number): Promise<DbResponse<any[]>> {
        return findWithColumnFilters<any>(TableName.ACCOUNT, {
            user_id: { operator: Operator.EQUAL, value: userId }
        });
    }

    /**
     * Updates an account by ID.
     *
     * @param id - ID of the account.
     * @param data - Partial account data to update.
     * @returns Updated account record.
     */
    async updateAccount(id: number, data: Partial<any>): Promise<DbResponse<any>> {
        if (data.user_id !== undefined) {
            const userService = new UserService();
            const user = await userService.getUserById(data.user_id);

            if (!user.success || !user.data) {
                return { success: false, error: Resource.USER_NOT_FOUND };
            }
        }

        await this.update(id, data);
        return this.findOne(id);
    }

    /**
     * Deletes an account by ID after validating its existence.
     *
     * @param id - ID of the account to delete.
     * @returns Success with deleted ID, or error if account does not exist.
     */
    async deleteAccount(id: number): Promise<DbResponse<{ id: number }>> {
        const existing = await this.findOne(id);

        if (!existing.success) {
            return { success: false, error: Resource.ACCOUNT_NOT_FOUND };
        }

        return this.remove(id);
    }
}
