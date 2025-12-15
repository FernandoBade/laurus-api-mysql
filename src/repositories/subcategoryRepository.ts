import { eq, and, inArray, desc, asc, SQL } from 'drizzle-orm';
import { db } from '../db';
import { subcategories, SelectSubcategory, InsertSubcategory } from '../db/schema';
import { Operator } from '../utils/enum';

/**
 * Repository for subcategory database operations.
 * Provides type-safe CRUD operations for subcategories using Drizzle ORM.
 */
export class SubcategoryRepository {
    /**
     * Finds a subcategory by its ID.
     *
     * @summary Retrieves a single subcategory by ID.
     * @param id - Subcategory ID to search for.
     * @returns Subcategory record if found, null otherwise.
     */
    async findById(id: number): Promise<SelectSubcategory | null> {
        const result = await db.select().from(subcategories).where(eq(subcategories.id, id)).limit(1);
        return result[0] || null;
    }

    /**
     * Finds multiple subcategories with optional filters and pagination.
     *
     * @summary Retrieves a list of subcategories with filtering and sorting.
     * @param filters - Optional filter conditions.
     * @param options - Optional pagination and sorting options.
     * @returns Array of subcategory records.
     */
    async findMany(
        filters?: {
            categoryId?: { operator: Operator.EQUAL | Operator.IN; value: number | number[] };
            active?: { operator: Operator.EQUAL; value: boolean };
        },
        options?: {
            limit?: number;
            offset?: number;
            sort?: keyof SelectSubcategory;
            order?: 'asc' | 'desc';
        }
    ): Promise<SelectSubcategory[]> {
        let query = db.select().from(subcategories);

        const conditions: SQL[] = [];
        if (filters?.categoryId) {
            if (filters.categoryId.operator === Operator.EQUAL) {
                conditions.push(eq(subcategories.categoryId, filters.categoryId.value as number));
            } else if (
                filters.categoryId.operator === Operator.IN &&
                Array.isArray(filters.categoryId.value)
            ) {
                conditions.push(inArray(subcategories.categoryId, filters.categoryId.value));
            }
        }
        if (filters?.active) {
            conditions.push(eq(subcategories.active, filters.active.value));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as typeof query;
        }

        if (options?.sort) {
            const column = subcategories[options.sort];
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
     * Counts subcategories matching optional filters.
     *
     * @summary Counts total subcategories matching filter criteria.
     * @param filters - Optional filter conditions.
     * @returns Total count of matching subcategories.
     */
    async count(
        filters?: {
            categoryId?: { operator: Operator.EQUAL | Operator.IN; value: number | number[] };
            active?: { operator: Operator.EQUAL; value: boolean };
        }
    ): Promise<number> {
        let query = db.select({ count: subcategories.id }).from(subcategories);

        const conditions: SQL[] = [];
        if (filters?.categoryId) {
            if (filters.categoryId.operator === Operator.EQUAL) {
                conditions.push(eq(subcategories.categoryId, filters.categoryId.value as number));
            } else if (Array.isArray(filters.categoryId.value)) {
                conditions.push(inArray(subcategories.categoryId, filters.categoryId.value));
            }
        }
        if (filters?.active) {
            conditions.push(eq(subcategories.active, filters.active.value));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as typeof query;
        }

        const result = await query;
        return result.length;
    }

    /**
     * Creates a new subcategory.
     *
     * @summary Inserts a new subcategory record.
     * @param data - Subcategory data to insert.
     * @returns The created subcategory record with generated ID.
     */
    async create(data: InsertSubcategory): Promise<SelectSubcategory> {
        const result = await db.insert(subcategories).values(data);
        const insertedId = result[0].insertId;
        const created = await this.findById(Number(insertedId));
        if (!created) {
            throw new Error('Failed to retrieve created subcategory');
        }
        return created;
    }

    /**
     * Updates an existing subcategory by ID.
     *
     * @summary Updates subcategory record with new data.
     * @param id - Subcategory ID to update.
     * @param data - Partial subcategory data to update.
     * @returns The updated subcategory record.
     */
    async update(id: number, data: Partial<InsertSubcategory>): Promise<SelectSubcategory> {
        await db.update(subcategories).set(data).where(eq(subcategories.id, id));
        const updated = await this.findById(id);
        if (!updated) {
            throw new Error('Subcategory not found after update');
        }
        return updated;
    }

    /**
     * Deletes a subcategory by ID.
     *
     * @summary Removes a subcategory record from the database.
     * @param id - Subcategory ID to delete.
     */
    async delete(id: number): Promise<void> {
        await db.delete(subcategories).where(eq(subcategories.id, id));
    }
}

