import { eq, and, desc, asc, SQL } from 'drizzle-orm';
import { db } from '../db';
import { logs, SelectLog, InsertLog } from '../db/schema';
import { FilterOperator } from '../../../shared/enums/operator.enums';

/**
 * Repository for log database operations.
 * Provides type-safe CRUD operations for logs using Drizzle ORM.
 */
export class LogRepository {
    /**
     * Finds a log by its ID.
     *
     * @summary Retrieves a single log by ID.
     * @param logId - Log ID to search for.
     * @returns Log record if found, null otherwise.
     */
    async findById(logId: number): Promise<SelectLog | null> {
        const result = await db.select().from(logs).where(eq(logs.id, logId)).limit(1);
        return result[0] || null;
    }

    /**
     * Finds multiple logs with optional filters and pagination.
     *
     * @summary Retrieves a list of logs with filtering and sorting.
     * @param filters - Optional filter conditions.
     * @param options - Optional pagination and sorting options.
     * @returns Array of log records.
     */
    async findMany(
        filters?: {
            userId?: { operator: FilterOperator.EQ; value: number };
        },
        options?: {
            limit?: number;
            offset?: number;
            sort?: keyof SelectLog;
            order?: 'asc' | 'desc';
        }
    ): Promise<SelectLog[]> {
        let query = db.select().from(logs);

        const conditions: SQL[] = [];
        if (filters?.userId) {
            conditions.push(eq(logs.userId, filters.userId.value));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as typeof query;
        }

        if (options?.sort) {
            const column = logs[options.sort];
            if (column) {
                query = query.orderBy(options.order === 'desc' ? desc(column) : asc(column)) as typeof query;
            }
        }

        if (options?.limit) {
            query = query.limit(options.limit) as typeof query;
        }

        if (options?.offset) {
            query = query.offset(options.offset) as typeof query;
        }

        return await query;
    }

    /**
     * Counts logs matching optional filters.
     *
     * @summary Counts total logs matching filter criteria.
     * @param filters - Optional filter conditions.
     * @returns Total count of matching logs.
     */
    async count(
        filters?: {
            userId?: { operator: FilterOperator.EQ; value: number };
        }
    ): Promise<number> {
        let query = db.select({ count: logs.id }).from(logs);

        const conditions: SQL[] = [];
        if (filters?.userId) {
            conditions.push(eq(logs.userId, filters.userId.value));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as typeof query;
        }

        const result = await query;
        return result.length;
    }

    /**
     * Creates a new log.
     *
     * @summary Inserts a new log record.
     * @param data - Log data to insert.
     * @returns The created log record with generated ID.
     */
    async create(data: InsertLog): Promise<SelectLog> {
        const result = await db.insert(logs).values(data);
        const insertedId = result[0].insertId;
        const created = await this.findById(Number(insertedId));
        if (!created) {
            throw new Error('RepositoryInvariantViolation: created record not found');
        }
        return created;
    }
}



