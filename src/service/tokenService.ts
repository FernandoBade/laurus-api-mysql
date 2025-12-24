import { TokenRepository } from '../repositories/tokenRepository';
import { SelectToken, InsertToken, tokens } from '../db/schema';
import { Resource } from '../utils/resources/resource';
import { LogCategory, LogOperation, LogType, TokenType } from '../utils/enum';
import { db } from '../db';
import { and, eq, lt } from 'drizzle-orm';
import { createLog } from '../utils/commons';

/**
 * Service for managing token operations in the database.
 * Provides CRUD functionality for tokens.
 */
export class TokenService {
    private tokenRepository: TokenRepository;

    constructor() {
        this.tokenRepository = new TokenRepository();
    }

    /**
     * Finds a token by ID.
     *
     * @summary Gets a token by ID.
     * @param id - token ID.
     * @returns token if found, null otherwise.
     */
    async findById(id: number): Promise<SelectToken | null> {
        return await this.tokenRepository.findById(id);
    }

    /**
     * Finds a token by token hash.
     *
     * @summary Gets a token by token hash.
     * @param tokenHash - Token hash.
     * @returns token if found, or error.
     */
    async findByTokenHash(tokenHash: string): Promise<{ success: true; data: SelectToken } | { success: false; error: Resource }> {
        const tokenRecord = await this.tokenRepository.findByTokenHash(tokenHash);
        if (!tokenRecord) {
            return { success: false, error: Resource.TOKEN_NOT_FOUND };
        }
        return { success: true, data: tokenRecord };
    }

    /**
     * Creates a new token.
     *
     * @summary Creates a token record.
     * @param data - token data.
     * @returns Created token or error.
     */
    async createToken(data: InsertToken): Promise<{ success: true; data: SelectToken } | { success: false; error: Resource }> {
        try {
            const created = await this.tokenRepository.create(data);
            return { success: true, data: created };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Deletes a token by ID.
     *
     * @summary Removes a token by ID.
     * @param id - token ID.
     * @returns Total rows affected.
     */
    async deleteToken(id: number): Promise<number> {
        return await this.tokenRepository.delete(id);
    }

    /**
     * Creates a new token (alias for compatibility).
     *
     * @summary Creates a token record.
     * @param data - token data.
     * @returns Created token.
     */
    async create(data: InsertToken): Promise<SelectToken> {
        return await this.tokenRepository.create(data);
    }

    /**
     * Deletes a token by ID (alias for compatibility).
     *
     * @summary Removes a token by ID.
     * @param id - token ID.
     * @returns Total rows affected.
     */
    async delete(id: number): Promise<number> {
        return await this.tokenRepository.delete(id);
    }

    /**
     * Deletes a token by token hash.
     *
     * @summary Removes a token by token hash.
     * @param tokenHash - Token hash.
     */
    async deleteByTokenHash(tokenHash: string): Promise<void> {
        await this.tokenRepository.deleteByTokenHash(tokenHash);
    }

    /**
     * Deletes all expired tokens.
     *
     * @summary Removes tokens that have expired.
     * @returns Total number of deleted entries or error on failure.
     */
    async deleteExpiredTokens(): Promise<{ success: true; data: { deleted: number } } | { success: false; error: Resource }> {
        try {
            const result = await db.delete(tokens)
                .where(and(eq(tokens.type, TokenType.REFRESH), lt(tokens.expiresAt, new Date())));

            const total = result[0]?.affectedRows ?? 0;

            await createLog(
                LogType.DEBUG,
                LogOperation.DELETE,
                LogCategory.AUTH,
                `Deleted ${total} expired tokens`,
                undefined
            );

            return { success: true, data: { deleted: total } };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }
}
