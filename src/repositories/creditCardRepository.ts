import { eq, and, desc, asc, SQL } from 'drizzle-orm';
import { db } from '../db';
import { creditCards, SelectCreditCard, InsertCreditCard } from '../db/schema';
import { Operator } from '../utils/enum';

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
    async findById(creditCardId: number): Promise<SelectCreditCard | null> {
        const result = await db.select().from(creditCards).where(eq(creditCards.id, creditCardId)).limit(1);
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
            userId?: { operator: Operator.EQUAL; value: number };
            accountId?: { operator: Operator.EQUAL; value: number };
            active?: { operator: Operator.EQUAL; value: boolean };
        },
        options?: {
            limit?: number;
            offset?: number;
            sort?: keyof SelectCreditCard;
            order?: 'asc' | 'desc';
        }
    ): Promise<SelectCreditCard[]> {
        let query = db.select().from(creditCards);

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
                query = query.orderBy(options.order === 'desc' ? desc(column) : asc(column)) as typeof query;
            }
        }

        if (options?.limit) {
            query = query.limit(options.limit) as typeof query  ;
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
            userId?: { operator: Operator.EQUAL; value: number };
            accountId?: { operator: Operator.EQUAL; value: number };
            active?: { operator: Operator.EQUAL; value: boolean };
        }
    ): Promise<number> {
        let query = db.select({ count: creditCards.id }).from(creditCards);

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
    async create(data: InsertCreditCard): Promise<SelectCreditCard> {
        const result = await db.insert(creditCards).values(data);
        const insertedId = result[0].insertId;
        const created = await this.findById(Number(insertedId));
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
    async update(creditCardId: number, data: Partial<InsertCreditCard>): Promise<SelectCreditCard> {
        await db.update(creditCards).set(data).where(eq(creditCards.id, creditCardId));
        const updated = await this.findById(creditCardId);
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
    async delete(creditCardId: number): Promise<void> {
        await db.delete(creditCards).where(eq(creditCards.id, creditCardId));
    }
}

