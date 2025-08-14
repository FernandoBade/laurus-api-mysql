import db from '../connections/dbConnection';
import { DbResponse } from '../services/dbResponse';
import { LogCategory, LogType, LogOperation, TableName, Operator } from '../../enum';
import { createLog } from '../../commons';
import { Resource } from '../../resources/resource';

/**
 * Inserts a new record into the specified table.
 * Returns the inserted entry including its generated ID.
 *
 * @param table - Target table name.
 * @param data - Record data to insert.
 */
export async function insert<T>(table: string, data: object): Promise<DbResponse<T>> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');

    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;

    try {
        const [result]: any = await db.query(query, values);
        return { success: true, data: { id: result.insertId, ...data } as T };
    } catch (error) {
        if (table !== TableName.LOG) {
            await createLog(
                LogType.ERROR,
                LogOperation.CREATE,
                LogCategory.LOG,
                {
                    error: Resource.INTERNAL_SERVER_ERROR,
                    message: `Error inserting into ${table}: ${(error as Error).message}`,
                    data,
                },
                undefined
            );
        }

        return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
    }
}

/**
 * Fetches a single record by ID from a specific table.
 *
 * @param table - Table name.
 * @param id - Record ID to look for.
 * @returns The found record or an error if not found.
 */
export async function findById<T>(table: string, id: number): Promise<DbResponse<T>> {
    const query = `SELECT * FROM ${table} WHERE id = ?`;
    const [rows]: any = await db.query(query, [id]);

    if (!rows.length) {
        return { success: false, error: Resource.NO_RECORDS_FOUND };
    }

    return { success: true, data: rows[0] };
}

/**
 * Performs a LIKE query on a specified table and column.
 *
 * @param table - The database table to search.
 * @param column - Column name to perform the LIKE query on.
 * @param searchTerm - Partial term to search for.
 * @returns A list of records that match the LIKE condition.
 */
export async function findByLike<T>(table: string, column: string, searchTerm: string): Promise<DbResponse<T[]>> {
    const term = `%${searchTerm}%`;
    const query = `SELECT * FROM ${table} WHERE ${column} LIKE ?`;

    const [rows]: any = await db.query(query, [term]);

    return { success: true, data: rows };
}

/**
 * Finds multiple records matching optional filters.
 *
 * @param table - The database table to query.
 * @param filter - Optional filter conditions as key-value pairs.
 * @returns A list of records matching the provided filters.
 */
export async function findMany<T>(table: string, filter?: object): Promise<DbResponse<T[]>> {
    let query = `SELECT * FROM ${table}`;
    const values: any[] = [];

    if (filter && Object.keys(filter).length) {
        const conditions = Object.keys(filter).map(key => {
            values.push((filter as any)[key]);
            return `${key} = ?`;
        });

        query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const [rows]: any = await db.query(query, values);

    return { success: true, data: rows };
}

/**
 * Performs a flexible and type-safe query using column-based filters.
 * Supports multiple operators like EQUAL, IN, LIKE, BETWEEN, ORDER, LIMIT, and OFFSET.
 *
 * @param table - Table name to search.
 * @param filters - Column filters using typed operators.
 * @param options - Pagination and ordering options.
 */
export async function findWithColumnFilters<T>(
    table: TableName | string,
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
    let query = `SELECT * FROM ${table}`;
    const values: any[] = [];

    if (filters && Object.keys(filters).length) {
        const conditions = Object.entries(filters).map(([column, f]) => {
            const { operator, value } = f as any;

            switch (operator) {
                case Operator.EQUAL:
                    values.push(value);
                    return `${column} = ?`;

                case Operator.IN:
                    if (!value.length) return '1 = 0';
                    values.push(...value);
                    return `${column} IN (${value.map(() => '?').join(', ')})`;

                case Operator.LIKE:
                    values.push(`%${value}%`);
                    return `${column} LIKE ?`;

                case Operator.BETWEEN:
                    values.push(...value);
                    return `${column} BETWEEN ? AND ?`;
            }
        });

        query += ` WHERE ${conditions.join(' AND ')}`;
    }

    if (options?.orderBy) {
        query += ` ORDER BY ${String(options.orderBy)} ${String(options.direction ?? Operator.ASC)}`;
    }

    if (options?.limit != null) {
        query += ` LIMIT ?`;
        values.push(options.limit);
    }

    if (options?.offset != null) {
        query += ` OFFSET ?`;
        values.push(options.offset);
    }

    const [rows]: any = await db.query(query, values);
    return { success: true, data: rows };
}

/**
 * Counts records using the same column-based filter logic as findWithColumnFilters.
 *
 * @param table - Table name to count rows from.
 * @param filters - Column filters using typed operators.
 */
export async function countWithColumnFilters<T>(
    table: TableName | string,
    filters?: {
        [K in keyof T]?:
        | { operator: Operator.EQUAL; value: T[K] }
        | { operator: Operator.IN; value: T[K][] }
        | (T[K] extends string ? { operator: Operator.LIKE; value: string } : never)
        | (T[K] extends number | Date ? { operator: Operator.BETWEEN; value: [T[K], T[K]] } : never);
    }
): Promise<DbResponse<number>> {
    let query = `SELECT COUNT(*) as count FROM ${table}`;
    const values: any[] = [];

    if (filters && Object.keys(filters).length) {
        const conditions = Object.entries(filters).map(([column, f]) => {
            const { operator, value } = f as any;

            switch (operator) {
                case Operator.EQUAL:
                    values.push(value);
                    return `${column} = ?`;

                case Operator.IN:
                    if (!value.length) return '1 = 0';
                    values.push(...value);
                    return `${column} IN (${value.map(() => '?').join(', ')})`;

                case Operator.LIKE:
                    values.push(`%${value}%`);
                    return `${column} LIKE ?`;

                case Operator.BETWEEN:
                    values.push(...value);
                    return `${column} BETWEEN ? AND ?`;
            }
        });

        query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const [rows]: any = await db.query(query, values);
    return { success: true, data: rows[0]?.count ?? 0 };
}

/**
 * Updates a record in a given table by its ID.
 * @param table - The database table to update.
 * @param id - ID of the record to update.
 * @param data - Data object with updated fields.
 * @returns Success status or an error message if the operation fails.
 */
export async function update(table: string, id: number, data: object): Promise<DbResponse<null>> {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;

    try {
        await db.query(query, [...values, id]);
        return { success: true };
    } catch {
        return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
    }
}

/**
 * Removes a record by its ID from a given table.
 * @param table - The database table to remove from.
 * @param id - ID of the record to remove.
 * @returns Success status or an error message if the operation fails.
 */
export async function remove(table: string, id: number): Promise<DbResponse<null>> {
    const query = `DELETE FROM ${table} WHERE id = ?`;

    try {
        const [result]: any = await db.query(query, [id]);

        if (result.affectedRows === 0) {
            return { success: false, error: Resource.NO_RECORDS_FOUND };
        }

        return { success: true };
    } catch {
        return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
    }
}

/**
 * Removes entries older than X days based on a date column.
 * @param table - The database table to operate on.
 * @param column - The column to compare the age (usually a date).
 * @param days - How many days old entries must be to be removed.
 */
export async function removeOlderThan(table: string, column: string, days: number): Promise<DbResponse<{ deleted: number }>> {
    const query = `DELETE FROM ${table} WHERE ${column} < DATE_SUB(NOW(), INTERVAL ? DAY)`;

    try {
        const [result]: any = await db.query(query, [days]);
        return { success: true, data: { deleted: result.affectedRows ?? 0 } };
    } catch {
        return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
    }
}
