import { eq, and, inArray, desc, asc, SQL } from 'drizzle-orm';
import { db } from '../db';
import { subcategories, SelectSubcategory, InsertSubcategory } from '../db/schema';
import { FilterOperator } from '../../../shared/enums/operator.enums';

/**
 * Repository for subcategory database operations.
 * Provides type-safe CRUD operations for subcategories using Drizzle ORM.
 */
export class SubcategoryRepository {
    /**
     * Finds a subcategory by its ID.
     *
     * @summary Retrieves a single subcategory by ID.
     * @param subcategoryId - Subcategory ID to search for.
     * @returns Subcategory record if found, null otherwise.
     */
    async findById(subcategoryId: number): Promise<SelectSubcategory | null> {
        const result = await db.select().from(subcategories).where(eq(subcategories.id, subcategoryId)).limit(1);
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
            categoryId?: { operator: FilterOperator.EQ | FilterOperator.IN; value: number | number[] };
            active?: { operator: FilterOperator.EQ; value: boolean };
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
            if (filters.categoryId.operator === FilterOperator.EQ) {
                conditions.push(eq(subcategories.categoryId, filters.categoryId.value as number));
            } else if (
                filters.categoryId.operator === FilterOperator.IN &&
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
            categoryId?: { operator: FilterOperator.EQ | FilterOperator.IN; value: number | number[] };
            active?: { operator: FilterOperator.EQ; value: boolean };
        }
    ): Promise<number> {
        let query = db.select({ count: subcategories.id }).from(subcategories);

        const conditions: SQL[] = [];
        if (filters?.categoryId) {
            if (filters.categoryId.operator === FilterOperator.EQ) {
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
            throw new Error('RepositoryInvariantViolation: created record not found');
        }
        return created;
    }

    /**
     * Updates an existing subcategory by ID.
     *
     * @summary Updates subcategory record with new data.
     * @param subcategoryId - Subcategory ID to update.
     * @param data - Partial subcategory data to update.
     * @returns The updated subcategory record.
     */
    async update(subcategoryId: number, data: Partial<InsertSubcategory>): Promise<SelectSubcategory> {
        await db.update(subcategories).set(data).where(eq(subcategories.id, subcategoryId));
        const updated = await this.findById(subcategoryId);
        if (!updated) {
            throw new Error('RepositoryInvariantViolation: updated record not found');
        }
        return updated;
    }

    /**
     * Deletes a subcategory by ID.
     *
     * @summary Removes a subcategory record from the database.
     * @param subcategoryId - Subcategory ID to delete.
     */
    async delete(subcategoryId: number): Promise<void> {
        await db.delete(subcategories).where(eq(subcategories.id, subcategoryId));
    }
}



