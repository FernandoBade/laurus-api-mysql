import { Operator, TableName } from '../utils/enum';
import { DbService } from '../utils/database/services/dbService';
import { DbResponse } from '../utils/database/services/dbResponse';
import { Resource } from '../utils/resources/resource';
import { findWithColumnFilters } from '../utils/database/helpers/dbHelpers';
import { UserService } from './userService';
import Account from '../model/account/account';

type AccountRow = Account & { user_id: number };

export class AccountService extends DbService {
    constructor() {
        super(TableName.ACCOUNT);
    }

    /**
     * @summary Creates a new financial account.
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
    }): Promise<DbResponse<AccountRow>> {
        const userService = new UserService();
        const user = await userService.getUserById(data.user_id);

        if (!user.success || !user.data) {
            return { success: false, error: Resource.USER_NOT_FOUND };
        }

        const result = await this.create<AccountRow>(data);
        if (!result.success || !result.data?.id) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }

        return this.findOne<AccountRow>(result.data.id);
    }

    /**
     * @summary Retrieves all financial accounts from the database.
     *
     * @returns A list of all account records.
     */
    async getAccounts(): Promise<DbResponse<AccountRow[]>> {
        return this.findMany<AccountRow>();
    }

    /**
     * @summary Retrieves a single account by its ID.
     *
     * @param id - ID of the account.
     * @returns Account record if found.
     */
    async getAccountById(id: number): Promise<DbResponse<AccountRow>> {
        return this.findOne<AccountRow>(id);
    }

    /**
     * @summary Retrieves all accounts associated with a given user ID.
     *
     * @param userId - ID of the user.
     * @returns A list of accounts owned by the user.
     */
    async getAccountsByUser(userId: number): Promise<DbResponse<AccountRow[]>> {
        return findWithColumnFilters<AccountRow>(TableName.ACCOUNT, {
            user_id: { operator: Operator.EQUAL, value: userId }
        });
    }

    /**
     * @summary Updates an account by ID.
     * Validates the user if the user_id is being changed.
     *
     * @param id - ID of the account.
     * @param data - Partial account data to update.
     * @returns Updated account record.
     */
    async updateAccount(id: number, data: Partial<AccountRow>): Promise<DbResponse<AccountRow>> {
        if (data.user_id !== undefined) {
            const userService = new UserService();
            const user = await userService.getUserById(data.user_id);

            if (!user.success || !user.data) {
                return { success: false, error: Resource.USER_NOT_FOUND };
            }
        }

        const updateResult = await this.update<AccountRow>(id, data);
        if (!updateResult.success) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }

        return this.findOne<AccountRow>(id);
    }

    /**
     * @summary Deletes an account by ID after validating its existence.
     *
     * @param id - ID of the account to delete.
     * @returns Success with deleted ID, or error if account does not exist.
     */
    async deleteAccount(id: number): Promise<DbResponse<{ id: number }>> {
        const existing = await this.findOne<AccountRow>(id);

        if (!existing.success) {
            return { success: false, error: Resource.ACCOUNT_NOT_FOUND };
        }

        return this.remove(id);
    }
}
