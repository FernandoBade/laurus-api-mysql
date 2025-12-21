"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditCardRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
/**
 * Repository for credit card database operations.
 * Provides type-safe CRUD operations for credit cards using Drizzle ORM.
 */
class CreditCardRepository {
    /**
     * Finds a credit card by its ID.
     *
     * @summary Retrieves a single credit card by ID.
     * @param id - Credit card ID to search for.
     * @returns Credit card record if found, null otherwise.
     */
    async findById(id) {
        const result = await db_1.db.select().from(schema_1.creditCards).where((0, drizzle_orm_1.eq)(schema_1.creditCards.id, id)).limit(1);
        return result[0] || null;
    }
    /**
     * Finds multiple credit cards with optional filters and pagination.
     *
     * @summary Retrieves a list of credit cards with filtering and sorting.
     * @param filters - Optional filter conditions.
     * @param options - Optional pagination and sorting options.
     * @returns Array of credit card records.
     */
    async findMany(filters, options) {
        let query = db_1.db.select().from(schema_1.creditCards);
        const conditions = [];
        if (filters === null || filters === void 0 ? void 0 : filters.userId) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.creditCards.userId, filters.userId.value));
        }
        if (filters === null || filters === void 0 ? void 0 : filters.accountId) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.creditCards.accountId, filters.accountId.value));
        }
        if (filters === null || filters === void 0 ? void 0 : filters.active) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.creditCards.active, filters.active.value));
        }
        if (conditions.length > 0) {
            query = query.where((0, drizzle_orm_1.and)(...conditions));
        }
        if (options === null || options === void 0 ? void 0 : options.sort) {
            const column = schema_1.creditCards[options.sort];
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
     * Counts credit cards matching optional filters.
     *
     * @summary Counts total credit cards matching filter criteria.
     * @param filters - Optional filter conditions.
     * @returns Total count of matching credit cards.
     */
    async count(filters) {
        let query = db_1.db.select({ count: schema_1.creditCards.id }).from(schema_1.creditCards);
        const conditions = [];
        if (filters === null || filters === void 0 ? void 0 : filters.userId) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.creditCards.userId, filters.userId.value));
        }
        if (filters === null || filters === void 0 ? void 0 : filters.accountId) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.creditCards.accountId, filters.accountId.value));
        }
        if (filters === null || filters === void 0 ? void 0 : filters.active) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.creditCards.active, filters.active.value));
        }
        if (conditions.length > 0) {
            query = query.where((0, drizzle_orm_1.and)(...conditions));
        }
        const result = await query;
        return result.length;
    }
    /**
     * Creates a new credit card.
     *
     * @summary Inserts a new credit card record.
     * @param data - Credit card data to insert.
     * @returns The created credit card record with generated ID.
     */
    async create(data) {
        const result = await db_1.db.insert(schema_1.creditCards).values(data);
        const insertedId = result[0].insertId;
        const created = await this.findById(Number(insertedId));
        if (!created) {
            throw new Error('Failed to retrieve created credit card');
        }
        return created;
    }
    /**
     * Updates an existing credit card by ID.
     *
     * @summary Updates credit card record with new data.
     * @param id - Credit card ID to update.
     * @param data - Partial credit card data to update.
     * @returns The updated credit card record.
     */
    async update(id, data) {
        await db_1.db.update(schema_1.creditCards).set(data).where((0, drizzle_orm_1.eq)(schema_1.creditCards.id, id));
        const updated = await this.findById(id);
        if (!updated) {
            throw new Error('Credit card not found after update');
        }
        return updated;
    }
    /**
     * Deletes a credit card by ID.
     *
     * @summary Removes a credit card record from the database.
     * @param id - Credit card ID to delete.
     */
    async delete(id) {
        await db_1.db.delete(schema_1.creditCards).where((0, drizzle_orm_1.eq)(schema_1.creditCards.id, id));
    }
}
exports.CreditCardRepository = CreditCardRepository;
