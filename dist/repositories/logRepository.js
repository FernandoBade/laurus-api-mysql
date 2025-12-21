"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
/**
 * Repository for log database operations.
 * Provides type-safe CRUD operations for logs using Drizzle ORM.
 */
class LogRepository {
    /**
     * Finds a log by its ID.
     *
     * @summary Retrieves a single log by ID.
     * @param id - Log ID to search for.
     * @returns Log record if found, null otherwise.
     */
    async findById(id) {
        const result = await db_1.db.select().from(schema_1.logs).where((0, drizzle_orm_1.eq)(schema_1.logs.id, id)).limit(1);
        return result[0] || null;
    }
    /**
     * Finds multiple logs with optional filters and pagination.
     *
     * @summary Retrieves a list of logs with filtering and sorting.
     * @param filters - Optional filter conditions.
     * @param options - Optional pagination and sorting options.
     * @returns Array of log records.
     */
    async findMany(filters, options) {
        let query = db_1.db.select().from(schema_1.logs);
        const conditions = [];
        if (filters === null || filters === void 0 ? void 0 : filters.userId) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.logs.userId, filters.userId.value));
        }
        if (conditions.length > 0) {
            query = query.where((0, drizzle_orm_1.and)(...conditions));
        }
        if (options === null || options === void 0 ? void 0 : options.sort) {
            const column = schema_1.logs[options.sort];
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
     * Counts logs matching optional filters.
     *
     * @summary Counts total logs matching filter criteria.
     * @param filters - Optional filter conditions.
     * @returns Total count of matching logs.
     */
    async count(filters) {
        let query = db_1.db.select({ count: schema_1.logs.id }).from(schema_1.logs);
        const conditions = [];
        if (filters === null || filters === void 0 ? void 0 : filters.userId) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.logs.userId, filters.userId.value));
        }
        if (conditions.length > 0) {
            query = query.where((0, drizzle_orm_1.and)(...conditions));
        }
        const result = await query;
        return result.length;
    }
    /**
     * Creates a new log.
     *
     * @summary Inserts a new log record.
     * @param data - Log data to insert.
     * @returns The created log record with generated ID.
     */
    async create(data) {
        const result = await db_1.db.insert(schema_1.logs).values(data);
        const insertedId = result[0].insertId;
        const created = await this.findById(Number(insertedId));
        if (!created) {
            throw new Error('Failed to retrieve created log');
        }
        return created;
    }
}
exports.LogRepository = LogRepository;
