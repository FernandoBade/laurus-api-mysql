import { eq, and, desc, asc, SQL } from 'drizzle-orm';
import { db } from '../db';
import { refreshTokens, SelectRefreshToken, InsertRefreshToken } from '../db/schema';
import { Operator } from '../utils/enum';

/**
 * Repository for refresh token database operations.
 * Provides type-safe CRUD operations for refresh tokens using Drizzle ORM.
 */
export class RefreshTokenRepository {
    /**
     * Finds a refresh token by its ID.
     *
     * @summary Retrieves a single refresh token by ID.
     * @param refreshTokenId - Refresh token ID to search for.
     * @returns Refresh token record if found, null otherwise.
     */
    async findById(refreshTokenId: number): Promise<SelectRefreshToken | null> {
        const result = await db.select().from(refreshTokens).where(eq(refreshTokens.id, refreshTokenId)).limit(1);
        return result[0] || null;
    }

    /**
     * Finds a refresh token by token string.
     *
     * @summary Retrieves a refresh token by its token value.
     * @param token - Token string to search for.
     * @returns Refresh token record if found, null otherwise.
     */
    async findByToken(token: string): Promise<SelectRefreshToken | null> {
        const result = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token)).limit(1);
        return result[0] || null;
    }

    /**
     * Finds multiple refresh tokens with optional filters and pagination.
     *
     * @summary Retrieves a list of refresh tokens with filtering and sorting.
     * @param filters - Optional filter conditions.
     * @param options - Optional pagination and sorting options.
     * @returns Array of refresh token records.
     */
    async findMany(
        filters?: {
            userId?: { operator: Operator.EQUAL; value: number };
        },
        options?: {
            limit?: number;
            offset?: number;
            sort?: keyof SelectRefreshToken;
            order?: 'asc' | 'desc';
        }
    ): Promise<SelectRefreshToken[]> {
        let query = db.select().from(refreshTokens);

        const conditions: SQL[] = [];
        if (filters?.userId) {
            conditions.push(eq(refreshTokens.userId, filters.userId.value));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as typeof query;
        }

        if (options?.sort) {
            const column = refreshTokens[options.sort];
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
     * Counts refresh tokens matching optional filters.
     *
     * @summary Counts total refresh tokens matching filter criteria.
     * @param filters - Optional filter conditions.
     * @returns Total count of matching refresh tokens.
     */
    async count(
        filters?: {
            userId?: { operator: Operator.EQUAL; value: number };
        }
    ): Promise<number> {
        let query = db.select({ count: refreshTokens.id }).from(refreshTokens);

        const conditions: SQL[] = [];
        if (filters?.userId) {
            conditions.push(eq(refreshTokens.userId, filters.userId.value));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as typeof query;
        }

        const result = await query;
        return result.length;
    }

    /**
     * Creates a new refresh token.
     *
     * @summary Inserts a new refresh token record.
     * @param data - Refresh token data to insert.
     * @returns The created refresh token record with generated ID.
     */
    async create(data: InsertRefreshToken): Promise<SelectRefreshToken> {
        const result = await db.insert(refreshTokens).values(data);
        const insertedId = result[0].insertId;
        const created = await this.findById(Number(insertedId));
        if (!created) {
            throw new Error('RepositoryInvariantViolation: created record not found');
        }
        return created;
    }

    /**
     * Deletes a refresh token by ID.
     *
     * @summary Removes a refresh token record from the database.
     * @param refreshTokenId - Refresh token ID to delete.
     */
    async delete(refreshTokenId: number): Promise<void> {
        await db.delete(refreshTokens).where(eq(refreshTokens.id, refreshTokenId));
    }

    /**
     * Deletes a refresh token by token string.
     *
     * @summary Removes a refresh token record by its token value.
     * @param token - Token string to delete.
     */
    async deleteByToken(token: string): Promise<void> {
        await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
    }
}

