import { Operator } from '../../enum';
import {
    insert,
    findById,
    findMany as findManyHelper,
    update,
    remove,
    findWithColumnFilters,
    count as countHelper,
} from '../helpers/dbHelpers';
import { DbResponse } from './dbResponse';

export interface QueryOptions<T> {
    limit?: number;
    offset?: number;
    sort?: keyof T;
    order?: 'asc' | 'desc';
}

/**
 * Abstract base class for services that interact with the database.
 * Provides reusable CRUD operations and advanced filtering logic using helper functions.
 */
export abstract class DbService {
    protected table: string;
    protected sortableColumns: string[];

    constructor(table: string, sortableColumns: string[] = []) {
        this.table = table;
        this.sortableColumns = sortableColumns;
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
    async findMany<T>(filter?: object, options?: QueryOptions<T>): Promise<DbResponse<T[]>> {
        let orderBy: string | undefined;
        let direction: Operator | undefined;

        if (options?.sort && this.sortableColumns.includes(String(options.sort))) {
            orderBy = String(options.sort);
            direction = options.order === 'desc' ? Operator.DESC : Operator.ASC;
        }

        return findManyHelper<T>(
            this.table,
            filter,
            orderBy,
            direction,
            options?.limit,
            options?.offset
        );
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
        options?: QueryOptions<T>
    ): Promise<DbResponse<T[]>> {
        let finalOptions: {
            orderBy?: keyof T;
            direction?: Operator;
            limit?: number;
            offset?: number;
        } | undefined;

        if (options) {
            finalOptions = {};

            if (options.sort && this.sortableColumns.includes(String(options.sort))) {
                finalOptions.orderBy = options.sort;
                finalOptions.direction = options.order === 'desc' ? Operator.DESC : Operator.ASC;
            }

            if (options.limit != null) {
                finalOptions.limit = options.limit;
            }

            if (options.offset != null) {
                finalOptions.offset = options.offset;
            }
        }

        return findWithColumnFilters<T>(this.table, filters, finalOptions);
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

    /**
     * Counts entries based on an optional filter object.
     * @param filter - Optional criteria to filter entries.
     * @returns Total number of records matching the provided filter.
     */
    async count(filter?: object): Promise<number> {
        return countHelper(this.table, filter);
    }
}
