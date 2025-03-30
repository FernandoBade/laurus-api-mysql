import bcrypt from 'bcrypt';
import { TableName } from '../utils/enum';
import { DbService } from '../utils/database/services/dbService';
import { findByLike } from '../utils/database/helpers/dbHelpers';
import { ErrorMessages } from '../utils/enum';
import { DbResponse } from '../utils/database/services/dbResponse';

export class UserService extends DbService {
    constructor() {
        super(TableName.USER);
    }

    /**
     * Creates a new user, ensuring the email is unique and hashing the password securely.
     * @param data - User data to be created.
     * @returns The newly created user, or an error if the email is already in use.
     */
    async createUser(data: { firstName: string; lastName: string; email: string; password: string }): Promise<DbResponse<any>> {
        data.email = data.email.trim().toLowerCase();

        const existingUsers = await this.findMany({ email: data.email });
        if (existingUsers.data?.length) {
            return { success: false, error: ErrorMessages.EMAIL_IN_USE };
        }

        data.password = await bcrypt.hash(data.password, 10);
        const result = await this.create(data);

        if (!result.success || !result.data?.id) {
            return { success: false, error: ErrorMessages.INTERNAL_SERVER_ERROR };
        }

        return this.findOne(result.data.id);
    }

    /**
     * Retrieves all registered users.
     * @returns A list containing total count and users.
     */
    async getUsers(): Promise<DbResponse<any[]>> {
        return this.findMany<any>();
    }
    /**
     * Retrieves a user by ID.
     * @param id - User ID.
     * @returns The user if found, or an error if not.
     */
    async getUserById(id: number): Promise<DbResponse<any>> {
        return this.findOne(id);
    }

    /**
     * Searches for users by email (partial match using LIKE).
     * @param emailTerm - Partial email to search for.
     * @returns A list of users whose emails match the search term.
     */
    async getUsersByEmail(emailTerm: string): Promise<DbResponse<any[]>> {
        return findByLike(this.table, 'email', emailTerm);
    }

    /**
     * Updates a user by ID and re-encrypts the password if changed.
     * @param id - ID of the user to be updated.
     * @param data - Data to be updated.
     * @returns The updated user if successful, or an error if not found.
     */
    async updateUser(id: number, data: any): Promise<DbResponse<any>> {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        await this.update(id, data);
        return this.findOne(id);
    }

    /**
     * Deletes a user by ID.
     * @param id - ID of the user to be deleted.
     * @returns Success status with ID of deleted user, or error if the operation fails.
     */
    async deleteUser(id: number): Promise<DbResponse<{ id: number }>> {
        const existingUser = await this.findOne(id);

        if (!existingUser.success) {
            return { success: false, error: ErrorMessages.USER_NOT_FOUND };
        }

        return this.remove(id);
    }

}
