import { eq, and, desc, asc, SQL, isNull } from 'drizzle-orm';
import { db } from '../db';
import { tokens, SelectToken, InsertToken } from '../db/schema';
import { Operator, TokenType } from '../utils/enum';

/**
 * Repository for token database operations.
 * Provides type-safe CRUD operations for tokens using Drizzle ORM.
 */
export class TokenRepository {
    /**
     * Finds a token by its ID.
     *
     * @summary Retrieves a single token by ID.
     * @param tokenId - Token ID to search for.
     * @returns Token record if found, null otherwise.
     */
    async findById(tokenId: number): Promise<SelectToken | null> {
        const result = await db.select().from(tokens).where(eq(tokens.id, tokenId)).limit(1);
        return result[0] || null;
    }

    /**
     * Finds a token by token hash.
     *
     * @summary Retrieves a token by its token hash.
     * @param tokenHash - Token hash to search for.
     * @returns Token record if found, null otherwise.
     */
    async findByTokenHash(tokenHash: string): Promise<SelectToken | null> {
        const result = await db.select()
            .from(tokens)
            .where(and(eq(tokens.tokenHash, tokenHash), eq(tokens.type, TokenType.REFRESH)))
            .limit(1);
        return result[0] || null;
    }

    /**
     * Finds a token by token hash and type.
     *
     * @summary Retrieves a token by token hash and type.
     * @param tokenHash - Token hash to search for.
     * @param type - Token type to match.
     * @returns Token record if found, null otherwise.
     */
    async findByTokenHashAndType(tokenHash: string, type: TokenType): Promise<SelectToken | null> {
        const result = await db.select()
            .from(tokens)
            .where(and(eq(tokens.tokenHash, tokenHash), eq(tokens.type, type)))
            .limit(1);
        return result[0] || null;
    }

    /**
     * Finds the most recent token for a user and type.
     *
     * @summary Retrieves latest token by user and type.
     * @param userId - User ID to search for.
     * @param type - Token type to match.
     * @returns Latest token record if found, null otherwise.
     */
    async findLatestByUserIdAndType(userId: number, type: TokenType): Promise<SelectToken | null> {
        const result = await db.select()
            .from(tokens)
            .where(and(eq(tokens.userId, userId), eq(tokens.type, type)))
            .orderBy(desc(tokens.createdAt))
            .limit(1);
        return result[0] || null;
    }

    /**
     * Finds multiple tokens with optional filters and pagination.
     *
     * @summary Retrieves a list of tokens with filtering and sorting.
     * @param filters - Optional filter conditions.
     * @param options - Optional pagination and sorting options.
     * @returns Array of token records.
     */
    async findMany(
        filters?: {
            userId?: { operator: Operator.EQUAL; value: number };
        },
        options?: {
            limit?: number;
            offset?: number;
            sort?: keyof SelectToken;
            order?: 'asc' | 'desc';
        }
    ): Promise<SelectToken[]> {
        let query = db.select().from(tokens);

        const conditions: SQL[] = [];
        conditions.push(eq(tokens.type, TokenType.REFRESH));
        if (filters?.userId) {
            conditions.push(eq(tokens.userId, filters.userId.value));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as typeof query;
        }

        if (options?.sort) {
            const column = tokens[options.sort];
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
     * Counts tokens matching optional filters.
     *
     * @summary Counts total tokens matching filter criteria.
     * @param filters - Optional filter conditions.
     * @returns Total count of matching tokens.
     */
    async count(
        filters?: {
            userId?: { operator: Operator.EQUAL; value: number };
        }
    ): Promise<number> {
        let query = db.select({ count: tokens.id }).from(tokens);

        const conditions: SQL[] = [];
        conditions.push(eq(tokens.type, TokenType.REFRESH));
        if (filters?.userId) {
            conditions.push(eq(tokens.userId, filters.userId.value));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as typeof query;
        }

        const result = await query;
        return result.length;
    }

    /**
     * Creates a new token.
     *
     * @summary Inserts a new token record.
     * @param data - Token data to insert.
     * @returns The created token record with generated ID.
     */
    async create(data: InsertToken): Promise<SelectToken> {
        const result = await db.insert(tokens).values(data);
        const insertedId = result[0].insertId;
        const created = await this.findById(Number(insertedId));
        if (!created) {
            throw new Error('RepositoryInvariantViolation: created record not found');
        }
        return created;
    }

    /**
     * Deletes a token by ID.
     *
     * @summary Removes a token record from the database.
     * @param tokenId - Token ID to delete.
     * @returns Total rows affected.
     */
    async delete(tokenId: number): Promise<number> {
        const result = await db.delete(tokens).where(eq(tokens.id, tokenId));
        return result[0]?.affectedRows ?? 0;
    }

    /**
     * Marks a token as revoked when it has already been rotated.
     *
     * @summary Sets the revokedAt timestamp for a token.
     * @param tokenId - Token ID to revoke.
     * @param revokedAt - Timestamp to store.
     * @returns Total rows affected.
     */
    async markTokenRevoked(tokenId: number, revokedAt: Date): Promise<number> {
        const result = await db.update(tokens)
            .set({ revokedAt })
            .where(and(eq(tokens.id, tokenId), isNull(tokens.revokedAt)));
        return result[0]?.affectedRows ?? 0;
    }

    /**
     * Deletes tokens by session ID.
     *
     * @summary Removes refresh tokens associated with a session.
     * @param sessionId - Session identifier.
     * @returns Total rows affected.
     */
    async deleteBySessionId(sessionId: string): Promise<number> {
        const result = await db.delete(tokens)
            .where(and(eq(tokens.sessionId, sessionId), eq(tokens.type, TokenType.REFRESH)));
        return result[0]?.affectedRows ?? 0;
    }

    /**
     * Deletes tokens by user ID and type.
     *
     * @summary Removes tokens for a user and token type.
     * @param userId - User ID.
     * @param type - Token type to delete.
     * @returns Total rows affected.
     */
    async deleteByUserIdAndType(userId: number, type: TokenType): Promise<number> {
        const result = await db.delete(tokens)
            .where(and(eq(tokens.userId, userId), eq(tokens.type, type)));
        return result[0]?.affectedRows ?? 0;
    }

    /**
     * Deletes a token by token hash.
     *
     * @summary Removes a token record by its token hash.
     * @param tokenHash - Token hash to delete.
     */
    async deleteByTokenHash(tokenHash: string): Promise<void> {
        await db.delete(tokens).where(and(eq(tokens.tokenHash, tokenHash), eq(tokens.type, TokenType.REFRESH)));
    }

    /**
     * Deletes a token by token hash and type.
     *
     * @summary Removes a token record by its token hash and type.
     * @param tokenHash - Token hash to delete.
     * @param type - Token type to delete.
     */
    async deleteByTokenHashAndType(tokenHash: string, type: TokenType): Promise<void> {
        await db.delete(tokens).where(and(eq(tokens.tokenHash, tokenHash), eq(tokens.type, type)));
    }
}

