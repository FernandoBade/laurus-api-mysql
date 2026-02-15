import { eq, like, and, desc, asc, SQL } from 'drizzle-orm';
import { db } from '../db';
import { users, SelectUser, InsertUser } from '../db/schema';
import { FilterOperator } from '../../../shared/enums/operator.enums';

/**
 * Repository for user database operations.
 * Provides type-safe CRUD operations for users using Drizzle ORM.
 */
export class UserRepository {
    /**
     * Finds a user by their ID.
     *
     * @summary Retrieves a single user by ID.
     * @param userId - User ID to search for.
     * @returns User record if found, null otherwise.
     */
    async findById(userId: number): Promise<SelectUser | null> {
        const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        return result[0] || null;
    }

    /**
     * Finds multiple users with optional filters and pagination.
     *
     * @summary Retrieves a list of users with filtering and sorting.
     * @param filters - Optional filter conditions.
     * @param options - Optional pagination and sorting options.
     * @returns Array of user records.
     */
    async findMany(
        filters?: {
            email?: { operator: FilterOperator.EQ | FilterOperator.LIKE; value: string };
            active?: { operator: FilterOperator.EQ; value: boolean };
        },
        options?: {
            limit?: number;
            offset?: number;
            sort?: keyof SelectUser;
            order?: 'asc' | 'desc';
        }
    ): Promise<SelectUser[]> {
        let query = db.select().from(users);

        const conditions: SQL[] = [];
        if (filters?.email) {
            if (filters.email.operator === FilterOperator.EQ) {
                conditions.push(eq(users.email, filters.email.value));
            } else if (filters.email.operator === FilterOperator.LIKE) {
                conditions.push(like(users.email, `%${filters.email.value}%`));
            }
        }
        if (filters?.active) {
            conditions.push(eq(users.active, filters.active.value));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as typeof query;
        }

        if (options?.sort) {
            const column = users[options.sort];
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
     * Counts users matching optional filters.
     *
     * @summary Counts total users matching filter criteria.
     * @param filters - Optional filter conditions.
     * @returns Total count of matching users.
     */
    async count(
        filters?: {
            email?: { operator: FilterOperator.EQ | FilterOperator.LIKE; value: string };
            active?: { operator: FilterOperator.EQ; value: boolean };
        }
    ): Promise<number> {
        let query = db.select({ count: users.id }).from(users);

        const conditions: SQL[] = [];
        if (filters?.email) {
            if (filters.email.operator === FilterOperator.EQ) {
                conditions.push(eq(users.email, filters.email.value));
            } else if (filters.email.operator === FilterOperator.LIKE) {
                conditions.push(like(users.email, `%${filters.email.value}%`));
            }
        }
        if (filters?.active) {
            conditions.push(eq(users.active, filters.active.value));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as typeof query;
        }

        const result = await query;
        return result.length;
    }

    /**
     * Creates a new user.
     *
     * @summary Inserts a new user record.
     * @param data - User data to insert.
     * @returns The created user record with generated ID.
     */
    async create(data: InsertUser): Promise<SelectUser> {
        const result = await db.insert(users).values(data);
        const insertedId = result[0].insertId;
        const created = await this.findById(Number(insertedId));
        if (!created) {
            throw new Error('RepositoryInvariantViolation: created record not found');
        }
        return created;
    }

    /**
     * Updates an existing user by ID.
     *
     * @summary Updates user record with new data.
     * @param userId - User ID to update.
     * @param data - Partial user data to update.
     * @returns The updated user record.
     */
    async update(userId: number, data: Partial<InsertUser>): Promise<SelectUser> {
        await db.update(users).set(data).where(eq(users.id, userId));
        const updated = await this.findById(userId);
        if (!updated) {
            throw new Error('RepositoryInvariantViolation: updated record not found');
        }
        return updated;
    }

    /**
     * Deletes a user by ID.
     *
     * @summary Removes a user record from the database.
     * @param userId - User ID to delete.
     */
    async delete(userId: number): Promise<void> {
        await db.delete(users).where(eq(users.id, userId));
    }
}



