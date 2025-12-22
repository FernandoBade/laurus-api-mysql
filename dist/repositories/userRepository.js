"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const enum_1 = require("../utils/enum");
/**
 * Repository for user database operations.
 * Provides type-safe CRUD operations for users using Drizzle ORM.
 */
class UserRepository {
    /**
     * Finds a user by their ID.
     *
     * @summary Retrieves a single user by ID.
     * @param userId - User ID to search for.
     * @returns User record if found, null otherwise.
     */
    async findById(userId) {
        const result = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId)).limit(1);
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
    async findMany(filters, options) {
        let query = db_1.db.select().from(schema_1.users);
        const conditions = [];
        if (filters === null || filters === void 0 ? void 0 : filters.email) {
            if (filters.email.operator === enum_1.Operator.EQUAL) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.users.email, filters.email.value));
            }
            else if (filters.email.operator === enum_1.Operator.LIKE) {
                conditions.push((0, drizzle_orm_1.like)(schema_1.users.email, `%${filters.email.value}%`));
            }
        }
        if (filters === null || filters === void 0 ? void 0 : filters.active) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.users.active, filters.active.value));
        }
        if (conditions.length > 0) {
            query = query.where((0, drizzle_orm_1.and)(...conditions));
        }
        if (options === null || options === void 0 ? void 0 : options.sort) {
            const column = schema_1.users[options.sort];
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
     * Counts users matching optional filters.
     *
     * @summary Counts total users matching filter criteria.
     * @param filters - Optional filter conditions.
     * @returns Total count of matching users.
     */
    async count(filters) {
        let query = db_1.db.select({ count: schema_1.users.id }).from(schema_1.users);
        const conditions = [];
        if (filters === null || filters === void 0 ? void 0 : filters.email) {
            if (filters.email.operator === enum_1.Operator.EQUAL) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.users.email, filters.email.value));
            }
            else if (filters.email.operator === enum_1.Operator.LIKE) {
                conditions.push((0, drizzle_orm_1.like)(schema_1.users.email, `%${filters.email.value}%`));
            }
        }
        if (filters === null || filters === void 0 ? void 0 : filters.active) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.users.active, filters.active.value));
        }
        if (conditions.length > 0) {
            query = query.where((0, drizzle_orm_1.and)(...conditions));
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
    async create(data) {
        const result = await db_1.db.insert(schema_1.users).values(data);
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
    async update(userId, data) {
        await db_1.db.update(schema_1.users).set(data).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
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
    async delete(userId) {
        await db_1.db.delete(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
    }
}
exports.UserRepository = UserRepository;
