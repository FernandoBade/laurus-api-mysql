import { eq, and, desc, asc, SQL } from 'drizzle-orm';
import { db } from '../db';
import { accounts, SelectAccount, InsertAccount } from '../db/schema';
import { Operator } from '../../../shared/enums';

/**
 * Repository for account database operations.
 * Provides type-safe CRUD operations for accounts using Drizzle ORM.
 */
export class AccountRepository {
    /**
     * Finds an account by its ID.
     *
     * @summary Retrieves a single account by ID.
     * @param accountId - Account ID to search for.
     * @returns Account record if found, null otherwise.
     */
    async findById(accountId: number, connection: typeof db = db): Promise<SelectAccount | null> {
        const result = await connection.select().from(accounts).where(eq(accounts.id, accountId)).limit(1);
        return result[0] || null;
    }

    /**
     * Finds multiple accounts with optional filters and pagination.
     *
     * @summary Retrieves a list of accounts with filtering and sorting.
     * @param filters - Optional filter conditions.
     * @param options - Optional pagination and sorting options.
     * @returns Array of account records.
     */
    async findMany(
        filters?: {
            userId?: { operator: Operator.EQUAL; value: number };
            active?: { operator: Operator.EQUAL; value: boolean };
        },
        options?: {
            limit?: number;
            offset?: number;
            sort?: keyof SelectAccount;
            order?: 'asc' | 'desc';
        },
        connection: typeof db = db
    ): Promise<SelectAccount[]> {
        let query = connection.select().from(accounts);

        const conditions: SQL[] = [];
        if (filters?.userId) {
            conditions.push(eq(accounts.userId, filters.userId.value));
        }
        if (filters?.active) {
            conditions.push(eq(accounts.active, filters.active.value));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as typeof query;
        }

        if (options?.sort) {
            const column = accounts[options.sort];
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
     * Counts accounts matching optional filters.
     *
     * @summary Counts total accounts matching filter criteria.
     * @param filters - Optional filter conditions.
     * @returns Total count of matching accounts.
     */
    async count(
        filters?: {
            userId?: { operator: Operator.EQUAL; value: number };
            active?: { operator: Operator.EQUAL; value: boolean };
        },
        connection: typeof db = db
    ): Promise<number> {
        let query = connection.select({ count: accounts.id }).from(accounts);

        const conditions: SQL[] = [];
        if (filters?.userId) {
            conditions.push(eq(accounts.userId, filters.userId.value));
        }
        if (filters?.active) {
            conditions.push(eq(accounts.active, filters.active.value));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as typeof query;
        }

        const result = await query;
        return result.length;
    }

    /**
     * Creates a new account.
     *
     * @summary Inserts a new account record.
     * @param data - Account data to insert.
     * @returns The created account record with generated ID.
     */
    async create(data: InsertAccount, connection: typeof db = db): Promise<SelectAccount> {
        const result = await connection.insert(accounts).values(data);
        const insertedId = result[0].insertId;
        const created = await this.findById(Number(insertedId), connection);
        if (!created) {
            throw new Error('RepositoryInvariantViolation: created record not found');
        }
        return created;
    }

    /**
     * Updates an existing account by ID.
     *
     * @summary Updates account record with new data.
     * @param accountId - Account ID to update.
     * @param data - Partial account data to update.
     * @returns The updated account record.
     */
    async update(accountId: number, data: Partial<InsertAccount>, connection: typeof db = db): Promise<SelectAccount> {
        await connection.update(accounts).set(data).where(eq(accounts.id, accountId));
        const updated = await this.findById(accountId, connection);
        if (!updated) {
            throw new Error('RepositoryInvariantViolation: updated record not found');
        }
        return updated;
    }

    /**
     * Deletes an account by ID.
     *
     * @summary Removes an account record from the database.
     * @param accountId - Account ID to delete.
     */
    async delete(accountId: number, connection: typeof db = db): Promise<void> {
        await connection.delete(accounts).where(eq(accounts.id, accountId));
    }
}

