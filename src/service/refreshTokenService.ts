import { RefreshTokenRepository } from '../repositories/refreshTokenRepository';
import { SelectRefreshToken, InsertRefreshToken } from '../db/schema';
import { Resource } from '../utils/resources/resource';

/**
 * Service for managing refresh token operations in the database.
 * Provides CRUD functionality for refresh tokens.
 */
export class RefreshTokenService {
    private refreshTokenRepository: RefreshTokenRepository;

    constructor() {
        this.refreshTokenRepository = new RefreshTokenRepository();
    }

    /**
     * Finds a refresh token by ID.
     *
     * @summary Gets a refresh token by ID.
     * @param id - Refresh token ID.
     * @returns Refresh token if found, null otherwise.
     */
    async findById(id: number): Promise<SelectRefreshToken | null> {
        return await this.refreshTokenRepository.findById(id);
    }

    /**
     * Finds a refresh token by token string.
     *
     * @summary Gets a refresh token by token value.
     * @param token - Token string.
     * @returns Refresh token if found, or error.
     */
    async findByToken(token: string): Promise<{ success: true; data: SelectRefreshToken } | { success: false; error: Resource }> {
        const tokenRecord = await this.refreshTokenRepository.findByToken(token);
        if (!tokenRecord) {
            return { success: false, error: Resource.TOKEN_NOT_FOUND };
        }
        return { success: true, data: tokenRecord };
    }

    /**
     * Creates a new refresh token.
     *
     * @summary Creates a refresh token record.
     * @param data - Refresh token data.
     * @returns Created refresh token or error.
     */
    async createRefreshToken(data: InsertRefreshToken): Promise<{ success: true; data: SelectRefreshToken } | { success: false; error: Resource }> {
        try {
            const created = await this.refreshTokenRepository.create(data);
            return { success: true, data: created };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Deletes a refresh token by ID.
     *
     * @summary Removes a refresh token by ID.
     * @param id - Refresh token ID.
     */
    async deleteRefreshToken(id: number): Promise<void> {
        await this.refreshTokenRepository.delete(id);
    }

    /**
     * Creates a new refresh token (alias for compatibility).
     *
     * @summary Creates a refresh token record.
     * @param data - Refresh token data.
     * @returns Created refresh token.
     */
    async create(data: InsertRefreshToken): Promise<SelectRefreshToken> {
        return await this.refreshTokenRepository.create(data);
    }

    /**
     * Deletes a refresh token by ID (alias for compatibility).
     *
     * @summary Removes a refresh token by ID.
     * @param id - Refresh token ID.
     */
    async delete(id: number): Promise<void> {
        await this.refreshTokenRepository.delete(id);
    }

    /**
     * Deletes a refresh token by token string.
     *
     * @summary Removes a refresh token by token value.
     * @param token - Token string.
     */
    async deleteByToken(token: string): Promise<void> {
        await this.refreshTokenRepository.deleteByToken(token);
    }
}
