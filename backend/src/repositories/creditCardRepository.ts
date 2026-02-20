import { eq, and, desc, asc, SQL, sql } from 'drizzle-orm';
import { db } from '../db';
import { creditCards, SelectCreditCard, InsertCreditCard } from '../db/schema';
import { FilterOperator, SortOrder } from '../../../shared/enums/operator.enums';
import type { MonetaryString } from '../../../shared/types/format.types';

/**
 * Repository for credit card database operations.
 * Provides type-safe CRUD operations for credit cards using Drizzle ORM.
 */
export class CreditCardRepository {
    /**
     * Finds a credit card by its ID.
     *
     * @summary Retrieves a single credit card by ID.
     * @param creditCardId - Credit card ID to search for.
     * @returns Credit card record if found, null otherwise.
     */
    async findById(creditCardId: number, connection: typeof db = db): Promise<SelectCreditCard | null> {
        const result = await connection.select().from(creditCards).where(eq(creditCards.id, creditCardId)).limit(1);
        return result[0] || null;
    }

    /**
     * Finds multiple credit cards with optional filters and pagination.
     *
     * @summary Retrieves a list of credit cards with filtering and sorting.
     * @param filters - Optional filter conditions.
     * @param options - Optional pagination and sorting options.
     * @returns Array of credit card records.
     */
    async findMany(
        filters?: {
            userId?: { operator: FilterOperator.EQ; value: number };
            accountId?: { operator: FilterOperator.EQ; value: number };
            active?: { operator: FilterOperator.EQ; value: boolean };
        },
        options?: {
            limit?: number;
            offset?: number;
            sort?: keyof SelectCreditCard;
            order?: SortOrder;
        },
        connection: typeof db = db
    ): Promise<SelectCreditCard[]> {
        let query = connection.select().from(creditCards);

        const conditions: SQL[] = [];
        if (filters?.userId) {
            conditions.push(eq(creditCards.userId, filters.userId.value));
        }
        if (filters?.accountId) {
            conditions.push(eq(creditCards.accountId, filters.accountId.value));
        }
        if (filters?.active) {
            conditions.push(eq(creditCards.active, filters.active.value));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as typeof query;
        }

        if (options?.sort) {
            const column = creditCards[options.sort];
            if (column) {
                query = query.orderBy(options.order === SortOrder.DESC ? desc(column) : asc(column)) as typeof query;
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
     * Counts credit cards matching optional filters.
     *
     * @summary Counts total credit cards matching filter criteria.
     * @param filters - Optional filter conditions.
     * @returns Total count of matching credit cards.
     */
    async count(
        filters?: {
            userId?: { operator: FilterOperator.EQ; value: number };
            accountId?: { operator: FilterOperator.EQ; value: number };
            active?: { operator: FilterOperator.EQ; value: boolean };
        },
        connection: typeof db = db
    ): Promise<number> {
        let query = connection.select({ count: creditCards.id }).from(creditCards);

        const conditions: SQL[] = [];
        if (filters?.userId) {
            conditions.push(eq(creditCards.userId, filters.userId.value));
        }
        if (filters?.accountId) {
            conditions.push(eq(creditCards.accountId, filters.accountId.value));
        }
        if (filters?.active) {
            conditions.push(eq(creditCards.active, filters.active.value));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as typeof query;
        }

        const result = await query;
        return result.length;
    }

    /**
     * Creates a new credit card.
     *
     * @summary Inserts a new credit card record.
     * @param data - Credit card data to insert.
     * @returns The created credit card record with generated ID.
     */
    async create(data: InsertCreditCard, connection: typeof db = db): Promise<SelectCreditCard> {
        const result = await connection.insert(creditCards).values(data);
        const insertedId = result[0].insertId;
        const created = await this.findById(Number(insertedId), connection);
        if (!created) {
            throw new Error('RepositoryInvariantViolation: created record not found');
        }
        return created;
    }

    /**
     * Updates an existing credit card by ID.
     *
     * @summary Updates credit card record with new data.
     * @param creditCardId - Credit card ID to update.
     * @param data - Partial credit card data to update.
     * @returns The updated credit card record.
     */
    async update(creditCardId: number, data: Partial<InsertCreditCard>, connection: typeof db = db): Promise<SelectCreditCard> {
        await connection.update(creditCards).set(data).where(eq(creditCards.id, creditCardId));
        const updated = await this.findById(creditCardId, connection);
        if (!updated) {
            throw new Error('RepositoryInvariantViolation: updated record not found');
        }
        return updated;
    }

    /**
     * Applies an atomic decimal delta to a credit card balance.
     *
     * @summary Mutates credit card balance with SQL arithmetic to avoid read-modify-write races.
     * @param creditCardId - Credit card ID to update.
     * @param delta - Monetary delta as a signed decimal string.
     * @param connection - Optional transactional connection.
     * @returns The updated credit card record.
     */
    async applyCreditCardDelta(
        creditCardId: number,
        delta: MonetaryString,
        connection: typeof db = db
    ): Promise<SelectCreditCard> {
        await connection
            .update(creditCards)
            .set({
                // SQL atomic delta keeps DECIMAL math in DB and avoids JS float/read-modify-write bugs.
                balance: sql`${creditCards.balance} + cast(${delta} as decimal(10,2))`,
            })
            .where(eq(creditCards.id, creditCardId));

        const updated = await this.findById(creditCardId, connection);
        if (!updated) {
            throw new Error('RepositoryInvariantViolation: updated record not found');
        }
        return updated;
    }

    /**
     * Deletes a credit card by ID.
     *
     * @summary Removes a credit card record from the database.
     * @param creditCardId - Credit card ID to delete.
     */
    async delete(creditCardId: number, connection: typeof db = db): Promise<void> {
        await connection.delete(creditCards).where(eq(creditCards.id, creditCardId));
    }
}
