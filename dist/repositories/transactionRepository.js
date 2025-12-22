"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const enum_1 = require("../utils/enum");
/**
 * Repository for transaction database operations.
 * Provides type-safe CRUD operations for transactions using Drizzle ORM.
 */
class TransactionRepository {
    /**
     * Finds a transaction by its ID.
     *
     * @summary Retrieves a single transaction by ID.
     * @param transactionId - Transaction ID to search for.
     * @returns Transaction record if found, null otherwise.
     */
    async findById(transactionId) {
        const result = await db_1.db.select().from(schema_1.transactions).where((0, drizzle_orm_1.eq)(schema_1.transactions.id, transactionId)).limit(1);
        return result[0] || null;
    }
    /**
     * Finds multiple transactions with optional filters and pagination.
     *
     * @summary Retrieves a list of transactions with filtering and sorting.
     * @param filters - Optional filter conditions.
     * @param options - Optional pagination and sorting options.
     * @returns Array of transaction records.
     */
    async findMany(filters, options) {
        let query = db_1.db.select().from(schema_1.transactions);
        const conditions = [];
        if (filters === null || filters === void 0 ? void 0 : filters.accountId) {
            if (filters.accountId.operator === enum_1.Operator.EQUAL) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.transactions.accountId, filters.accountId.value));
            }
            else if (Array.isArray(filters.accountId.value)) {
                conditions.push((0, drizzle_orm_1.inArray)(schema_1.transactions.accountId, filters.accountId.value));
            }
        }
        if (filters === null || filters === void 0 ? void 0 : filters.creditCardId) {
            if (filters.creditCardId.operator === enum_1.Operator.EQUAL) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.transactions.creditCardId, filters.creditCardId.value));
            }
            else if (Array.isArray(filters.creditCardId.value)) {
                conditions.push((0, drizzle_orm_1.inArray)(schema_1.transactions.creditCardId, filters.creditCardId.value));
            }
        }
        if (filters === null || filters === void 0 ? void 0 : filters.categoryId) {
            if (filters.categoryId.operator === enum_1.Operator.EQUAL) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.transactions.categoryId, filters.categoryId.value));
            }
            else if (Array.isArray(filters.categoryId.value)) {
                conditions.push((0, drizzle_orm_1.inArray)(schema_1.transactions.categoryId, filters.categoryId.value));
            }
        }
        if (filters === null || filters === void 0 ? void 0 : filters.subcategoryId) {
            if (filters.subcategoryId.operator === enum_1.Operator.EQUAL) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.transactions.subcategoryId, filters.subcategoryId.value));
            }
            else if (Array.isArray(filters.subcategoryId.value)) {
                conditions.push((0, drizzle_orm_1.inArray)(schema_1.transactions.subcategoryId, filters.subcategoryId.value));
            }
        }
        if (filters === null || filters === void 0 ? void 0 : filters.active) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.transactions.active, filters.active.value));
        }
        if (filters === null || filters === void 0 ? void 0 : filters.date) {
            conditions.push((0, drizzle_orm_1.between)(schema_1.transactions.date, filters.date.value[0], filters.date.value[1]));
        }
        if (conditions.length > 0) {
            query = query.where((0, drizzle_orm_1.and)(...conditions));
        }
        if (options === null || options === void 0 ? void 0 : options.sort) {
            const column = schema_1.transactions[options.sort];
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
     * Counts transactions matching optional filters.
     *
     * @summary Counts total transactions matching filter criteria.
     * @param filters - Optional filter conditions.
     * @returns Total count of matching transactions.
     */
    async count(filters) {
        let query = db_1.db.select({ count: schema_1.transactions.id }).from(schema_1.transactions);
        const conditions = [];
        if (filters === null || filters === void 0 ? void 0 : filters.accountId) {
            if (filters.accountId.operator === enum_1.Operator.EQUAL) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.transactions.accountId, filters.accountId.value));
            }
            else if (Array.isArray(filters.accountId.value)) {
                conditions.push((0, drizzle_orm_1.inArray)(schema_1.transactions.accountId, filters.accountId.value));
            }
        }
        if (filters === null || filters === void 0 ? void 0 : filters.creditCardId) {
            if (filters.creditCardId.operator === enum_1.Operator.EQUAL) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.transactions.creditCardId, filters.creditCardId.value));
            }
            else if (Array.isArray(filters.creditCardId.value)) {
                conditions.push((0, drizzle_orm_1.inArray)(schema_1.transactions.creditCardId, filters.creditCardId.value));
            }
        }
        if (filters === null || filters === void 0 ? void 0 : filters.categoryId) {
            if (filters.categoryId.operator === enum_1.Operator.EQUAL) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.transactions.categoryId, filters.categoryId.value));
            }
            else if (Array.isArray(filters.categoryId.value)) {
                conditions.push((0, drizzle_orm_1.inArray)(schema_1.transactions.categoryId, filters.categoryId.value));
            }
        }
        if (filters === null || filters === void 0 ? void 0 : filters.subcategoryId) {
            if (filters.subcategoryId.operator === enum_1.Operator.EQUAL) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.transactions.subcategoryId, filters.subcategoryId.value));
            }
            else if (Array.isArray(filters.subcategoryId.value)) {
                conditions.push((0, drizzle_orm_1.inArray)(schema_1.transactions.subcategoryId, filters.subcategoryId.value));
            }
        }
        if (filters === null || filters === void 0 ? void 0 : filters.active) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.transactions.active, filters.active.value));
        }
        if (conditions.length > 0) {
            query = query.where((0, drizzle_orm_1.and)(...conditions));
        }
        const result = await query;
        return result.length;
    }
    /**
     * Creates a new transaction.
     *
     * @summary Inserts a new transaction record.
     * @param data - Transaction data to insert.
     * @returns The created transaction record with generated ID.
     */
    async create(data) {
        const result = await db_1.db.insert(schema_1.transactions).values(data);
        const insertedId = result[0].insertId;
        const created = await this.findById(Number(insertedId));
        if (!created) {
            throw new Error('RepositoryInvariantViolation: created record not found');
        }
        return created;
    }
    /**
     * Updates an existing transaction by ID.
     *
     * @summary Updates transaction record with new data.
     * @param transactionId - Transaction ID to update.
     * @param data - Partial transaction data to update.
     * @returns The updated transaction record.
     */
    async update(transactionId, data) {
        await db_1.db.update(schema_1.transactions).set(data).where((0, drizzle_orm_1.eq)(schema_1.transactions.id, transactionId));
        const updated = await this.findById(transactionId);
        if (!updated) {
            throw new Error('RepositoryInvariantViolation: updated record not found');
        }
        return updated;
    }
    /**
     * Deletes a transaction by ID.
     *
     * @summary Removes a transaction record from the database.
     * @param transactionId - Transaction ID to delete.
     */
    async delete(transactionId) {
        await db_1.db.delete(schema_1.transactions).where((0, drizzle_orm_1.eq)(schema_1.transactions.id, transactionId));
    }
}
exports.TransactionRepository = TransactionRepository;
