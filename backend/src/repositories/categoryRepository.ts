import { eq, and, desc, asc, SQL } from 'drizzle-orm';
import { db } from '../db';
import { categories, SelectCategory, InsertCategory } from '../db/schema';
import { Operator } from '../../../shared/enums';

/**
 * Repository for category database operations.
 * Provides type-safe CRUD operations for categories using Drizzle ORM.
 */
export class CategoryRepository {
    /**
     * Finds a category by its ID.
     *
     * @summary Retrieves a single category by ID.
     * @param categoryId - Category ID to search for.
     * @returns Category record if found, null otherwise.
     */
    async findById(categoryId: number): Promise<SelectCategory | null> {
        const result = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1);
        return result[0] || null;
    }

    /**
     * Finds multiple categories with optional filters and pagination.
     *
     * @summary Retrieves a list of categories with filtering and sorting.
     * @param filters - Optional filter conditions.
     * @param options - Optional pagination and sorting options.
     * @returns Array of category records.
     */
    async findMany(
        filters?: {
            userId?: { operator: Operator.EQUAL; value: number };
            active?: { operator: Operator.EQUAL; value: boolean };
        },
        options?: {
            limit?: number;
            offset?: number;
            sort?: keyof SelectCategory;
            order?: 'asc' | 'desc';
        }
    ): Promise<SelectCategory[]> {
        let query = db.select().from(categories);

        const conditions: SQL[] = [];
        if (filters?.userId) {
            conditions.push(eq(categories.userId, filters.userId.value));
        }
        if (filters?.active) {
            conditions.push(eq(categories.active, filters.active.value));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as typeof query;
        }

        if (options?.sort) {
            const column = categories[options.sort];
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
     * Counts categories matching optional filters.
     *
     * @summary Counts total categories matching filter criteria.
     * @param filters - Optional filter conditions.
     * @returns Total count of matching categories.
     */
    async count(
        filters?: {
            userId?: { operator: Operator.EQUAL; value: number };
            active?: { operator: Operator.EQUAL; value: boolean };
        }
    ): Promise<number> {
        let query = db.select({ count: categories.id }).from(categories);

        const conditions: SQL[] = [];
        if (filters?.userId) {
            conditions.push(eq(categories.userId, filters.userId.value));
        }
        if (filters?.active) {
            conditions.push(eq(categories.active, filters.active.value));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as typeof query;
        }

        const result = await query;
        return result.length;
    }

    /**
     * Creates a new category.
     *
     * @summary Inserts a new category record.
     * @param data - Category data to insert.
     * @returns The created category record with generated ID.
     */
    async create(data: InsertCategory): Promise<SelectCategory> {
        const result = await db.insert(categories).values(data);
        const insertedId = result[0].insertId;
        const created = await this.findById(Number(insertedId));
        if (!created) {
            throw new Error('RepositoryInvariantViolation: created record not found');
        }
        return created;
    }

    /**
     * Updates an existing category by ID.
     *
     * @summary Updates category record with new data.
     * @param categoryId - Category ID to update.
     * @param data - Partial category data to update.
     * @returns The updated category record.
     */
    async update(categoryId: number, data: Partial<InsertCategory>): Promise<SelectCategory> {
        await db.update(categories).set(data).where(eq(categories.id, categoryId));
        const updated = await this.findById(categoryId);
        if (!updated) {
            throw new Error('RepositoryInvariantViolation: updated record not found');
        }
        return updated;
    }

    /**
     * Deletes a category by ID.
     *
     * @summary Removes a category record from the database.
     * @param categoryId - Category ID to delete.
     */
    async delete(categoryId: number): Promise<void> {
        await db.delete(categories).where(eq(categories.id, categoryId));
    }
}



