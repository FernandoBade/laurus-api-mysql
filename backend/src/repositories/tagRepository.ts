import { eq, and, inArray, desc, asc, SQL } from 'drizzle-orm';
import { db } from '../db';
import { tags, SelectTag, InsertTag } from '../db/schema';
import { Operator } from '../utils/enum';

/**
 * Repository for tag database operations.
 * Provides type-safe CRUD operations for tags using Drizzle ORM.
 */
export class TagRepository {
    /**
     * Finds a tag by its ID.
     *
     * @summary Retrieves a single tag by ID.
     * @param tagId - Tag ID to search for.
     * @returns Tag record if found, null otherwise.
     */
    async findById(tagId: number, connection: typeof db = db): Promise<SelectTag | null> {
        const result = await connection.select().from(tags).where(eq(tags.id, tagId)).limit(1);
        return result[0] || null;
    }

    /**
     * Finds multiple tags with optional filters and pagination.
     *
     * @summary Retrieves a list of tags with filtering and sorting.
     * @param filters - Optional filter conditions.
     * @param options - Optional pagination and sorting options.
     * @returns Array of tag records.
     */
    async findMany(
        filters?: {
            id?: { operator: Operator.EQUAL | Operator.IN; value: number | number[] };
            userId?: { operator: Operator.EQUAL; value: number };
            name?: { operator: Operator.EQUAL; value: string };
            active?: { operator: Operator.EQUAL; value: boolean };
        },
        options?: {
            limit?: number;
            offset?: number;
            sort?: keyof SelectTag;
            order?: 'asc' | 'desc';
        },
        connection: typeof db = db
    ): Promise<SelectTag[]> {
        let query = connection.select().from(tags);

        const conditions: SQL[] = [];
        if (filters?.id) {
            if (filters.id.operator === Operator.EQUAL) {
                conditions.push(eq(tags.id, filters.id.value as number));
            } else if (Array.isArray(filters.id.value)) {
                conditions.push(inArray(tags.id, filters.id.value));
            }
        }
        if (filters?.userId) {
            conditions.push(eq(tags.userId, filters.userId.value));
        }
        if (filters?.name) {
            conditions.push(eq(tags.name, filters.name.value));
        }
        if (filters?.active) {
            conditions.push(eq(tags.active, filters.active.value));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as typeof query;
        }

        if (options?.sort) {
            const column = tags[options.sort];
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
     * Counts tags matching optional filters.
     *
     * @summary Counts total tags matching filter criteria.
     * @param filters - Optional filter conditions.
     * @returns Total count of matching tags.
     */
    async count(
        filters?: {
            userId?: { operator: Operator.EQUAL; value: number };
            active?: { operator: Operator.EQUAL; value: boolean };
        },
        connection: typeof db = db
    ): Promise<number> {
        let query = connection.select({ count: tags.id }).from(tags);

        const conditions: SQL[] = [];
        if (filters?.userId) {
            conditions.push(eq(tags.userId, filters.userId.value));
        }
        if (filters?.active) {
            conditions.push(eq(tags.active, filters.active.value));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as typeof query;
        }

        const result = await query;
        return result.length;
    }

    /**
     * Creates a new tag.
     *
     * @summary Inserts a new tag record.
     * @param data - Tag data to insert.
     * @returns The created tag record with generated ID.
     */
    async create(data: InsertTag, connection: typeof db = db): Promise<SelectTag> {
        const result = await connection.insert(tags).values(data);
        const insertedId = result[0].insertId;
        const created = await this.findById(Number(insertedId), connection);
        if (!created) {
            throw new Error('RepositoryInvariantViolation: created record not found');
        }
        return created;
    }

    /**
     * Updates an existing tag by ID.
     *
     * @summary Updates tag record with new data.
     * @param tagId - Tag ID to update.
     * @param data - Partial tag data to update.
     * @returns The updated tag record.
     */
    async update(tagId: number, data: Partial<InsertTag>, connection: typeof db = db): Promise<SelectTag> {
        await connection.update(tags).set(data).where(eq(tags.id, tagId));
        const updated = await this.findById(tagId, connection);
        if (!updated) {
            throw new Error('RepositoryInvariantViolation: updated record not found');
        }
        return updated;
    }

    /**
     * Deletes a tag by ID.
     *
     * @summary Removes a tag record from the database.
     * @param tagId - Tag ID to delete.
     */
    async delete(tagId: number, connection: typeof db = db): Promise<void> {
        await connection.delete(tags).where(eq(tags.id, tagId));
    }
}
