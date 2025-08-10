import { Operator } from '../../enum';
import { insert, findById, findMany, update, remove, findWithColumnFilters } from '../helpers/dbHelpers';
import { DbResponse } from './dbResponse';

/**
 * Abstract base class for services that interact with the database.
 * Provides reusable CRUD operations and advanced filtering logic using helper functions.
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
    async findOne<T>(id: number): Promise<DbResponse<T>> {
        return findById<T>(this.table, id);
    }

    /**
     * Finds multiple entries based on an optional filter object.
     * @param filter - Optional criteria to filter entries.
     * @returns List of found entries.
     */
    async findMany<T>(filter?: object): Promise<DbResponse<T[]>> {
        return findMany<T>(this.table, filter);
    }

    /**
     * Finds entries using advanced column filters with type-safe operators.
     * Supports '=', 'IN', 'LIKE', 'BETWEEN', ORDER BY, LIMIT and OFFSET.
     *
     * @param filters - Optional filters by column with operators.
     * @param options - Optional ordering and pagination options.
     * @returns Matching records or an empty list.
     */
    async findWithFilters<T>(
        filters?: {
            [K in keyof T]?:
            | { operator: Operator.EQUAL; value: T[K] }
            | { operator: Operator.IN; value: T[K][] }
            | (T[K] extends string ? { operator: Operator.LIKE; value: string } : never)
            | (T[K] extends number | Date ? { operator: Operator.BETWEEN; value: [T[K], T[K]] } : never);
        },
        options?: {
            orderBy?: keyof T;
            direction?: Operator;
            limit?: number;
            offset?: number;
        }
    ): Promise<DbResponse<T[]>> {
        return findWithColumnFilters<T>(this.table, filters, options);
    }

    /**
     * Creates a new entry in the database.
     * @param data - Data to create the new entry.
     * @returns The newly created entry.
     */
    async create<T>(data: object): Promise<DbResponse<T>> {
        return insert<T>(this.table, data);
    }

    /**
     * Updates an existing entry by its ID.
     * @param id - ID of the entry to update.
     * @param data - Data to be updated.
     * @returns Updated entry or an error if entry not found.
     */
    async update<T>(id: number, data: object): Promise<DbResponse<T>> {
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
