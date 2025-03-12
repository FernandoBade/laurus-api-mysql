import { TableName } from '../utils/enum';
import { runQuery } from '../utils/database';
import {
    getById,
    saveEntry,
    updateEntry,
    deleteEntry,
    searchEntry
} from '../utils/commons';
import bcrypt from 'bcrypt';

export class UserService {
    private table = TableName.USER_OLD;

    /**
     * Creates a new user, ensuring the email is unique and hashing the password securely.
     * @param data - User data to be created.
     * @returns The newly created user, or an error if the email is already in use.
     */
    async createUser(data: { firstName: string; lastName: string; email: string; password: string; }) {
        data.email = data.email.trim().toLowerCase();

        const users = await searchEntry(this.table, 'email', data.email);
        if (users.length > 0) {
            return { error: 'Email is already in use' };
        }

        data.password = await bcrypt.hash(data.password, 10);
        const newUser = await saveEntry(this.table, data);

        const completeUser = await getById(this.table, newUser.id);
        return completeUser;
    }

    /**
     * Retrieves all registered users.
     * @returns A list of all registered users.
     */
    async getUsers() {
        const users = await searchEntry(this.table);
        return { total: users.length, users };
    }

    /**
     * Retrieves a user by ID.
     * @param id - User ID.
     * @returns The user if found, or an error if not.
     */
    async getUserById(id: number) {
        const user = await getById(this.table, id);
        return 'error' in user ? { error: 'User not found' } : user;
    }

    /**
     * Searches for users by email (partial match using LIKE).
     * @param emailTerm - Partial email to search for.
     * @returns A list of users whose emails match the search term.
     */
    async getUsersByEmail(emailTerm: string) {
        const term = `%${emailTerm}%`;
        const users: any = await runQuery(`SELECT * FROM ${this.table} WHERE email LIKE ?`, [term]);
        return { total: users.length, users };
    }

    /**
     * Updates a user by ID and re-encrypts the password if changed.
     * @param id - ID of the user to be updated.
     * @param data - Data to be updated.
     * @returns The updated user if successful, or an error if not found.
     */
    async updateUser(id: number, data: any) {
        const user = await getById(this.table, id);
        if ('error' in user) {
            return { error: 'User not found' };
        }

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        await updateEntry(this.table, id, data);
        const updatedUser = await getById(this.table, id);

        return updatedUser;
    }

    /**
     * Deletes a user by ID.
     * @param id - ID of the user to be deleted.
     * @returns The ID of the deleted user, or an error if not found.
     */
    async deleteUser(id: number) {
        const user = await getById(this.table, id);
        if ('error' in user) {
            return { error: 'User not found' };
        }

        await deleteEntry(this.table, id);
        return { id };
    }
}
