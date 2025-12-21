"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenService = void 0;
const refreshTokenRepository_1 = require("../repositories/refreshTokenRepository");
const resource_1 = require("../utils/resources/resource");
/**
 * Service for managing refresh token operations in the database.
 * Provides CRUD functionality for refresh tokens.
 */
class RefreshTokenService {
    constructor() {
        this.refreshTokenRepository = new refreshTokenRepository_1.RefreshTokenRepository();
    }
    /**
     * Finds a refresh token by ID.
     *
     * @summary Gets a refresh token by ID.
     * @param id - Refresh token ID.
     * @returns Refresh token if found, null otherwise.
     */
    async findById(id) {
        return await this.refreshTokenRepository.findById(id);
    }
    /**
     * Finds a refresh token by token string.
     *
     * @summary Gets a refresh token by token value.
     * @param token - Token string.
     * @returns Refresh token if found, or error.
     */
    async findByToken(token) {
        const tokenRecord = await this.refreshTokenRepository.findByToken(token);
        if (!tokenRecord) {
            return { success: false, error: resource_1.Resource.TOKEN_NOT_FOUND };
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
    async createRefreshToken(data) {
        try {
            const created = await this.refreshTokenRepository.create(data);
            return { success: true, data: created };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Deletes a refresh token by ID.
     *
     * @summary Removes a refresh token by ID.
     * @param id - Refresh token ID.
     */
    async deleteRefreshToken(id) {
        await this.refreshTokenRepository.delete(id);
    }
    /**
     * Creates a new refresh token (alias for compatibility).
     *
     * @summary Creates a refresh token record.
     * @param data - Refresh token data.
     * @returns Created refresh token.
     */
    async create(data) {
        return await this.refreshTokenRepository.create(data);
    }
    /**
     * Deletes a refresh token by ID (alias for compatibility).
     *
     * @summary Removes a refresh token by ID.
     * @param id - Refresh token ID.
     */
    async delete(id) {
        await this.refreshTokenRepository.delete(id);
    }
    /**
     * Deletes a refresh token by token string.
     *
     * @summary Removes a refresh token by token value.
     * @param token - Token string.
     */
    async deleteByToken(token) {
        await this.refreshTokenRepository.deleteByToken(token);
    }
}
exports.RefreshTokenService = RefreshTokenService;
