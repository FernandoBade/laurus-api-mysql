import { insert, findById, findMany, update, remove } from '../helpers/dbHelpers';
import { DbResponse } from './dbResponse';

/**
 * Abstract class providing reusable CRUD methods for database operations.
 */
export abstract class DbService {
    protected table: string;

    constructor(table: string) {
        this.table = table;
    }

    /**
     * Finds a single entry by its ID.
     * @param id - The ID of the entry to retrieve.
     * @returns The found entry or an error if not found.
     */
    async findOne<T = any>(id: number): Promise<DbResponse<T>> {
        return findById<T>(this.table, id);
    }

    /**
     * Finds multiple entries based on an optional filter object.
     * @param filter - Optional criteria to filter entries.
     * @returns List of found entries.
     */
    async findMany<T = any>(filter?: object): Promise<DbResponse<T[]>> {
        return findMany<T>(this.table, filter);
    }

    /**
     * Creates a new entry in the database.
     * @param data - Data to create the new entry.
     * @returns The newly created entry.
     */
    async create<T = any>(data: object): Promise<DbResponse<T>> {
        return insert<T>(this.table, data);
    }

    /**
     * Updates an existing entry by its ID.
     * @param id - ID of the entry to update.
     * @param data - Data to be updated.
     * @returns Updated entry or an error if entry not found.
     */
    async update<T = any>(id: number, data: object): Promise<DbResponse<T>> {
        const updateResult = await update(this.table, id, data);

        if (!updateResult.success) {
            return { success: false, error: updateResult.error };
        }

        return findById<T>(this.table, id);
    }

    /**
     * Deletes an entry by its ID.
     * @param id - ID of the entry to delete.
     * @returns Success status or error if deletion fails.
     */
    async remove(id: number): Promise<DbResponse<{ id: number }>> {
        const result = await remove(this.table, id);

        if (!result.success) {
            return { success: false, error: result.error };
        }

        return { success: true, data: { id } };
    }
}
