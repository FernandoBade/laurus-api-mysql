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
    private table = TableName.USER;

    /**
     * Creates a new user, ensuring the email is unique and encrypting the password.
     * @param data - User data to be created.
     * @returns Returns the created user or an error if the email is already in use.
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
     * @returns Returns an array of users.
     */
    async getUsers() {
        const users = await searchEntry(this.table);
        return { total: users.length, users };
    }

    /**
     * Retrieves a user by ID.
     * @param id - User ID.
     * @returns Returns the found user or an error if not found.
     */
    async getUserById(id: number) {
        const user = await getById(this.table, id);
        return 'error' in user ? { error: 'User not found' } : user;
    }

    /**
     * Searches for users by email (partial match using LIKE).
     * @param emailTerm - Search term for the email.
     * @returns Returns a list of users matching the search term.
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
     * @returns Returns the updated user or an error if not found.
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
     * @returns Returns the deleted user's ID or an error if not found.
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
