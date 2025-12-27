import { eq, and, inArray, between, desc, asc, SQL, gte, lte } from 'drizzle-orm';
import { db } from '../db';
import { transactions, SelectTransaction, InsertTransaction } from '../db/schema';
import { Operator } from '../utils/enum';

/**
 * Repository for transaction database operations.
 * Provides type-safe CRUD operations for transactions using Drizzle ORM.
 */
export class TransactionRepository {
    /**
     * Finds a transaction by its ID.
     *
     * @summary Retrieves a single transaction by ID.
     * @param transactionId - Transaction ID to search for.
     * @returns Transaction record if found, null otherwise.
     */
    async findById(transactionId: number, connection: typeof db = db): Promise<SelectTransaction | null> {
        const result = await connection.select().from(transactions).where(eq(transactions.id, transactionId)).limit(1);
        return result[0] || null;
    }

    /**
     * Finds multiple transactions with optional filters and pagination.
     *
     * @summary Retrieves a list of transactions with filtering and sorting.
     * @param filters - Optional filter conditions.
     * @param options - Optional pagination and sorting options.
     * @returns Array of transaction records.
     */
    async findMany(
        filters?: {
            accountId?: { operator: Operator.EQUAL | Operator.IN; value: number | number[] };
            creditCardId?: { operator: Operator.EQUAL | Operator.IN; value: number | number[] };
            categoryId?: { operator: Operator.EQUAL | Operator.IN; value: number | number[] };
            subcategoryId?: { operator: Operator.EQUAL | Operator.IN; value: number | number[] };
            active?: { operator: Operator.EQUAL; value: boolean };
            date?: { operator: Operator.BETWEEN; value: [Date, Date] };
        },
        options?: {
            limit?: number;
            offset?: number;
            sort?: keyof SelectTransaction;
            order?: 'asc' | 'desc';
        },
        connection: typeof db = db
    ): Promise<SelectTransaction[]> {
        let query = connection.select().from(transactions);

        const conditions: SQL[] = [];
        if (filters?.accountId) {
            if (filters.accountId.operator === Operator.EQUAL) {
                conditions.push(eq(transactions.accountId, filters.accountId.value as number));
            } else if (Array.isArray(filters.accountId.value)) {
                conditions.push(inArray(transactions.accountId, filters.accountId.value));
            }
        }
        if (filters?.creditCardId) {
            if (filters.creditCardId.operator === Operator.EQUAL) {
                conditions.push(eq(transactions.creditCardId, filters.creditCardId.value as number));
            } else if (Array.isArray(filters.creditCardId.value)) {
                conditions.push(inArray(transactions.creditCardId, filters.creditCardId.value));
            }
        }
        if (filters?.categoryId) {
            if (filters.categoryId.operator === Operator.EQUAL) {
                conditions.push(eq(transactions.categoryId, filters.categoryId.value as number));
            } else if (Array.isArray(filters.categoryId.value)) {
                conditions.push(inArray(transactions.categoryId, filters.categoryId.value));
            }
        }
        if (filters?.subcategoryId) {
            if (filters.subcategoryId.operator === Operator.EQUAL) {
                conditions.push(eq(transactions.subcategoryId, filters.subcategoryId.value as number));
            } else if (Array.isArray(filters.subcategoryId.value)) {
                conditions.push(inArray(transactions.subcategoryId, filters.subcategoryId.value));
            }
        }
        if (filters?.active) {
            conditions.push(eq(transactions.active, filters.active.value));
        }
        if (filters?.date) {
            conditions.push(between(transactions.date, filters.date.value[0], filters.date.value[1]));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as typeof query;
        }

        if (options?.sort) {
            const column = transactions[options.sort];
            if (column) {
                query = query.orderBy(options.order === 'desc' ? desc(column) : asc(column)) as typeof query;
            }
        }

        if (options?.limit) {
            query = query.limit(options.limit) as typeof query;
        }

        if (options?.offset) {
            query = query.offset(options.offset) as typeof query    ;
        }

        return await query;
    }

    /**
     * Counts transactions matching optional filters.
     *
     * @summary Counts total transactions matching filter criteria.
     * @param filters - Optional filter conditions.
     * @returns Total count of matching transactions.
     */
    async count(
        filters?: {
            accountId?: { operator: Operator.EQUAL | Operator.IN; value: number | number[] };
            creditCardId?: { operator: Operator.EQUAL | Operator.IN; value: number | number[] };
            categoryId?: { operator: Operator.EQUAL | Operator.IN; value: number | number[] };
            subcategoryId?: { operator: Operator.EQUAL | Operator.IN; value: number | number[] };
            active?: { operator: Operator.EQUAL; value: boolean };
        },
        connection: typeof db = db
    ): Promise<number> {
        let query = connection.select({ count: transactions.id }).from(transactions);

        const conditions: SQL[] = [];
        if (filters?.accountId) {
            if (filters.accountId.operator === Operator.EQUAL) {
                conditions.push(eq(transactions.accountId, filters.accountId.value as number));
            } else if (Array.isArray(filters.accountId.value)) {
                conditions.push(inArray(transactions.accountId, filters.accountId.value));
            }
        }
        if (filters?.creditCardId) {
            if (filters.creditCardId.operator === Operator.EQUAL) {
                conditions.push(eq(transactions.creditCardId, filters.creditCardId.value as number));
            } else if (Array.isArray(filters.creditCardId.value)) {
                conditions.push(inArray(transactions.creditCardId, filters.creditCardId.value));
            }
        }
        if (filters?.categoryId) {
            if (filters.categoryId.operator === Operator.EQUAL) {
                conditions.push(eq(transactions.categoryId, filters.categoryId.value as number));
            } else if (Array.isArray(filters.categoryId.value)) {
                conditions.push(inArray(transactions.categoryId, filters.categoryId.value));
            }
        }
        if (filters?.subcategoryId) {
            if (filters.subcategoryId.operator === Operator.EQUAL) {
                conditions.push(eq(transactions.subcategoryId, filters.subcategoryId.value as number));
            } else if (Array.isArray(filters.subcategoryId.value)) {
                conditions.push(inArray(transactions.subcategoryId, filters.subcategoryId.value));
            }
        }
        if (filters?.active) {
            conditions.push(eq(transactions.active, filters.active.value));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as typeof query;
        }

        const result = await query;
        return result.length;
    }

    /**
     * Creates a new transaction.
     *
     * @summary Inserts a new transaction record.
     * @param data - Transaction data to insert.
     * @returns The created transaction record with generated ID.
     */
    async create(data: InsertTransaction, connection: typeof db = db): Promise<SelectTransaction> {
        const result = await connection.insert(transactions).values(data);
        const insertedId = result[0].insertId;
        const created = await this.findById(Number(insertedId), connection);
        if (!created) {
            throw new Error('RepositoryInvariantViolation: created record not found');
        }
        return created;
    }

    /**
     * Updates an existing transaction by ID.
     *
     * @summary Updates transaction record with new data.
     * @param transactionId - Transaction ID to update.
     * @param data - Partial transaction data to update.
     * @returns The updated transaction record.
     */
    async update(transactionId: number, data: Partial<InsertTransaction>, connection: typeof db = db): Promise<SelectTransaction> {
        await connection.update(transactions).set(data).where(eq(transactions.id, transactionId));
        const updated = await this.findById(transactionId, connection);
        if (!updated) {
            throw new Error('RepositoryInvariantViolation: updated record not found');
        }
        return updated;
    }

    /**
     * Deletes a transaction by ID.
     *
     * @summary Removes a transaction record from the database.
     * @param transactionId - Transaction ID to delete.
     */
    async delete(transactionId: number, connection: typeof db = db): Promise<void> {
        await connection.delete(transactions).where(eq(transactions.id, transactionId));
    }
}

