"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
/**
 * Repository for account database operations.
 * Provides type-safe CRUD operations for accounts using Drizzle ORM.
 */
class AccountRepository {
    /**
     * Finds an account by its ID.
     *
     * @summary Retrieves a single account by ID.
     * @param id - Account ID to search for.
     * @returns Account record if found, null otherwise.
     */
    async findById(id) {
        const result = await db_1.db.select().from(schema_1.accounts).where((0, drizzle_orm_1.eq)(schema_1.accounts.id, id)).limit(1);
        return result[0] || null;
    }
    /**
     * Finds multiple accounts with optional filters and pagination.
     *
     * @summary Retrieves a list of accounts with filtering and sorting.
     * @param filters - Optional filter conditions.
     * @param options - Optional pagination and sorting options.
     * @returns Array of account records.
     */
    async findMany(filters, options) {
        let query = db_1.db.select().from(schema_1.accounts);
        const conditions = [];
        if (filters === null || filters === void 0 ? void 0 : filters.userId) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.accounts.userId, filters.userId.value));
        }
        if (filters === null || filters === void 0 ? void 0 : filters.active) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.accounts.active, filters.active.value));
        }
        if (conditions.length > 0) {
            query = query.where((0, drizzle_orm_1.and)(...conditions));
        }
        if (options === null || options === void 0 ? void 0 : options.sort) {
            const column = schema_1.accounts[options.sort];
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
     * Counts accounts matching optional filters.
     *
     * @summary Counts total accounts matching filter criteria.
     * @param filters - Optional filter conditions.
     * @returns Total count of matching accounts.
     */
    async count(filters) {
        let query = db_1.db.select({ count: schema_1.accounts.id }).from(schema_1.accounts);
        const conditions = [];
        if (filters === null || filters === void 0 ? void 0 : filters.userId) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.accounts.userId, filters.userId.value));
        }
        if (filters === null || filters === void 0 ? void 0 : filters.active) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.accounts.active, filters.active.value));
        }
        if (conditions.length > 0) {
            query = query.where((0, drizzle_orm_1.and)(...conditions));
        }
        const result = await query;
        return result.length;
    }
    /**
     * Creates a new account.
     *
     * @summary Inserts a new account record.
     * @param data - Account data to insert.
     * @returns The created account record with generated ID.
     */
    async create(data) {
        const result = await db_1.db.insert(schema_1.accounts).values(data);
        const insertedId = result[0].insertId;
        const created = await this.findById(Number(insertedId));
        if (!created) {
            throw new Error('Failed to retrieve created account');
        }
        return created;
    }
    /**
     * Updates an existing account by ID.
     *
     * @summary Updates account record with new data.
     * @param id - Account ID to update.
     * @param data - Partial account data to update.
     * @returns The updated account record.
     */
    async update(id, data) {
        await db_1.db.update(schema_1.accounts).set(data).where((0, drizzle_orm_1.eq)(schema_1.accounts.id, id));
        const updated = await this.findById(id);
        if (!updated) {
            throw new Error('Account not found after update');
        }
        return updated;
    }
    /**
     * Deletes an account by ID.
     *
     * @summary Removes an account record from the database.
     * @param id - Account ID to delete.
     */
    async delete(id) {
        await db_1.db.delete(schema_1.accounts).where((0, drizzle_orm_1.eq)(schema_1.accounts.id, id));
    }
}
exports.AccountRepository = AccountRepository;
