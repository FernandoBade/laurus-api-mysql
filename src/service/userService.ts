import bcrypt from 'bcrypt';
import { Operator, TableName } from '../utils/enum';
import { DbService } from '../utils/database/services/dbService';
import { findWithColumnFilters } from '../utils/database/helpers/dbHelpers';
import { DbResponse } from '../utils/database/services/dbResponse';
import { Resource } from '../utils/resources/resource';

export class UserService extends DbService {
    constructor() {
        super(TableName.USER);
    }

    /**
     * Removes sensitive fields from the user object.
     *
     * @param data - Raw user object with sensitive fields.
     * @returns User object without the password.
     */
    private sanitizeUser(data: any): any {
        if (!data) return data;
        const { password, ...safeUser } = data;
        return safeUser;
    }

    /**
     * Creates a new user with a unique email and hashed password.
     * Validates that the email is not already registered.
     *
     * @param data - User registration data.
     * @returns Created user record or error if email is already in use.
     */
    async createUser(data: { firstName: string; lastName: string; email: string; password: string }): Promise<DbResponse<any>> {
        data.email = data.email.trim().toLowerCase();

        const existingUsers = await this.findWithFilters<any>({
            email: { operator: Operator.EQUAL, value: data.email }
        });

        if (existingUsers.data?.length) {
            return { success: false, error: Resource.EMAIL_IN_USE };
        }

        data.password = await bcrypt.hash(data.password, 10);
        const result = await this.create(data);

        if (!result.success || !result.data?.id) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }

        const created = await this.findOne(result.data.id);
        return {
            ...created,
            data: this.sanitizeUser(created.data)
        };
    }

    /**
     * Retrieves a list of all users in the database.
     *
     * @returns List of user records.
     */
    async getUsers(): Promise<DbResponse<any[]>> {
        const users = await this.findMany<any>();
        return {
            ...users,
            data: users.data?.map(this.sanitizeUser)
        };
    }

    /**
     * Retrieves a user by their unique ID.
     *
     * @param id - ID of the user.
     * @returns User record if found, or error if not.
     */
    async getUserById(id: number): Promise<DbResponse<any>> {
        const user = await this.findOne(id);
        return {
            ...user,
            data: this.sanitizeUser(user.data)
        };
    }

    /**
     * Searches for users by partial email using a LIKE clause.
     *
     * @param emailTerm - Email search term (partial match).
     * @returns List of users matching the email filter.
     */
    async getUsersByEmail(emailTerm: string): Promise<DbResponse<any[]>> {
        const result = await findWithColumnFilters<any>(TableName.USER, {
            email: { operator: Operator.LIKE, value: emailTerm }
        });
        return {
            ...result,
            data: result.data?.map(this.sanitizeUser)
        };
    }

    /**
     * Updates a user by ID and rehashes the password if it has changed.
     *
     * @param id - ID of the user to update.
     * @param data - Partial user data.
     * @returns Updated user or error if not found.
     */
    async updateUser(id: number, data: any): Promise<DbResponse<any>> {
        const current = await this.findOne(id);

        if (data.password && current.success && current.data?.password) {
            const isSamePassword = await bcrypt.compare(data.password, current.data.password);
            if (!isSamePassword) {
                data.password = await bcrypt.hash(data.password, 10);
            } else {
                delete data.password;
            }
        }

        await this.update(id, data);
        const updated = await this.findOne(id);
        return {
            ...updated,
            data: this.sanitizeUser(updated.data)
        };
    }

    /**
     * Deletes a user by ID after validating its existence.
     *
     * @param id - ID of the user to delete.
     * @returns Success with deleted ID, or error if user does not exist.
     */
    async deleteUser(id: number): Promise<DbResponse<{ id: number }>> {
        const existingUser = await this.findOne(id);

        if (!existingUser.success) {
            return { success: false, error: Resource.USER_NOT_FOUND };
        }

        return this.remove(id);
    }
}
