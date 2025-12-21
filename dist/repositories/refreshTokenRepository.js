"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
/**
 * Repository for refresh token database operations.
 * Provides type-safe CRUD operations for refresh tokens using Drizzle ORM.
 */
class RefreshTokenRepository {
    /**
     * Finds a refresh token by its ID.
     *
     * @summary Retrieves a single refresh token by ID.
     * @param id - Refresh token ID to search for.
     * @returns Refresh token record if found, null otherwise.
     */
    async findById(id) {
        const result = await db_1.db.select().from(schema_1.refreshTokens).where((0, drizzle_orm_1.eq)(schema_1.refreshTokens.id, id)).limit(1);
        return result[0] || null;
    }
    /**
     * Finds a refresh token by token string.
     *
     * @summary Retrieves a refresh token by its token value.
     * @param token - Token string to search for.
     * @returns Refresh token record if found, null otherwise.
     */
    async findByToken(token) {
        const result = await db_1.db.select().from(schema_1.refreshTokens).where((0, drizzle_orm_1.eq)(schema_1.refreshTokens.token, token)).limit(1);
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
    async findMany(filters, options) {
        let query = db_1.db.select().from(schema_1.refreshTokens);
        const conditions = [];
        if (filters === null || filters === void 0 ? void 0 : filters.userId) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.refreshTokens.userId, filters.userId.value));
        }
        if (conditions.length > 0) {
            query = query.where((0, drizzle_orm_1.and)(...conditions));
        }
        if (options === null || options === void 0 ? void 0 : options.sort) {
            const column = schema_1.refreshTokens[options.sort];
            if (column) {
                query = query.orderBy(options.order === 'desc' ? (0, drizzle_orm_1.desc)(column) : (0, drizzle_orm_1.asc)(column));
            }
        }
        if (options === null || options === void 0 ? void 0 : options.limit) {
            query = query.limit(options.limit);
        }
        if (options === null || options === void 0 ? void 0 : options.offset) {
            query = query.offset(options.offset);
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
    async count(filters) {
        let query = db_1.db.select({ count: schema_1.refreshTokens.id }).from(schema_1.refreshTokens);
        const conditions = [];
        if (filters === null || filters === void 0 ? void 0 : filters.userId) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.refreshTokens.userId, filters.userId.value));
        }
        if (conditions.length > 0) {
            query = query.where((0, drizzle_orm_1.and)(...conditions));
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
    async create(data) {
        const result = await db_1.db.insert(schema_1.refreshTokens).values(data);
        const insertedId = result[0].insertId;
        const created = await this.findById(Number(insertedId));
        if (!created) {
            throw new Error('Failed to retrieve created refresh token');
        }
        return created;
    }
    /**
     * Deletes a refresh token by ID.
     *
     * @summary Removes a refresh token record from the database.
     * @param id - Refresh token ID to delete.
     */
    async delete(id) {
        await db_1.db.delete(schema_1.refreshTokens).where((0, drizzle_orm_1.eq)(schema_1.refreshTokens.id, id));
    }
    /**
     * Deletes a refresh token by token string.
     *
     * @summary Removes a refresh token record by its token value.
     * @param token - Token string to delete.
     */
    async deleteByToken(token) {
        await db_1.db.delete(schema_1.refreshTokens).where((0, drizzle_orm_1.eq)(schema_1.refreshTokens.token, token));
    }
}
exports.RefreshTokenRepository = RefreshTokenRepository;
