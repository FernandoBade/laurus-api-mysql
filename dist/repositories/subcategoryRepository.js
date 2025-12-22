"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubcategoryRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const enum_1 = require("../utils/enum");
/**
 * Repository for subcategory database operations.
 * Provides type-safe CRUD operations for subcategories using Drizzle ORM.
 */
class SubcategoryRepository {
    /**
     * Finds a subcategory by its ID.
     *
     * @summary Retrieves a single subcategory by ID.
     * @param subcategoryId - Subcategory ID to search for.
     * @returns Subcategory record if found, null otherwise.
     */
    async findById(subcategoryId) {
        const result = await db_1.db.select().from(schema_1.subcategories).where((0, drizzle_orm_1.eq)(schema_1.subcategories.id, subcategoryId)).limit(1);
        return result[0] || null;
    }
    /**
     * Finds multiple subcategories with optional filters and pagination.
     *
     * @summary Retrieves a list of subcategories with filtering and sorting.
     * @param filters - Optional filter conditions.
     * @param options - Optional pagination and sorting options.
     * @returns Array of subcategory records.
     */
    async findMany(filters, options) {
        let query = db_1.db.select().from(schema_1.subcategories);
        const conditions = [];
        if (filters === null || filters === void 0 ? void 0 : filters.categoryId) {
            if (filters.categoryId.operator === enum_1.Operator.EQUAL) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.subcategories.categoryId, filters.categoryId.value));
            }
            else if (filters.categoryId.operator === enum_1.Operator.IN &&
                Array.isArray(filters.categoryId.value)) {
                conditions.push((0, drizzle_orm_1.inArray)(schema_1.subcategories.categoryId, filters.categoryId.value));
            }
        }
        if (filters === null || filters === void 0 ? void 0 : filters.active) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.subcategories.active, filters.active.value));
        }
        if (conditions.length > 0) {
            query = query.where((0, drizzle_orm_1.and)(...conditions));
        }
        if (options === null || options === void 0 ? void 0 : options.sort) {
            const column = schema_1.subcategories[options.sort];
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
     * Counts subcategories matching optional filters.
     *
     * @summary Counts total subcategories matching filter criteria.
     * @param filters - Optional filter conditions.
     * @returns Total count of matching subcategories.
     */
    async count(filters) {
        let query = db_1.db.select({ count: schema_1.subcategories.id }).from(schema_1.subcategories);
        const conditions = [];
        if (filters === null || filters === void 0 ? void 0 : filters.categoryId) {
            if (filters.categoryId.operator === enum_1.Operator.EQUAL) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.subcategories.categoryId, filters.categoryId.value));
            }
            else if (Array.isArray(filters.categoryId.value)) {
                conditions.push((0, drizzle_orm_1.inArray)(schema_1.subcategories.categoryId, filters.categoryId.value));
            }
        }
        if (filters === null || filters === void 0 ? void 0 : filters.active) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.subcategories.active, filters.active.value));
        }
        if (conditions.length > 0) {
            query = query.where((0, drizzle_orm_1.and)(...conditions));
        }
        const result = await query;
        return result.length;
    }
    /**
     * Creates a new subcategory.
     *
     * @summary Inserts a new subcategory record.
     * @param data - Subcategory data to insert.
     * @returns The created subcategory record with generated ID.
     */
    async create(data) {
        const result = await db_1.db.insert(schema_1.subcategories).values(data);
        const insertedId = result[0].insertId;
        const created = await this.findById(Number(insertedId));
        if (!created) {
            throw new Error('RepositoryInvariantViolation: created record not found');
        }
        return created;
    }
    /**
     * Updates an existing subcategory by ID.
     *
     * @summary Updates subcategory record with new data.
     * @param subcategoryId - Subcategory ID to update.
     * @param data - Partial subcategory data to update.
     * @returns The updated subcategory record.
     */
    async update(subcategoryId, data) {
        await db_1.db.update(schema_1.subcategories).set(data).where((0, drizzle_orm_1.eq)(schema_1.subcategories.id, subcategoryId));
        const updated = await this.findById(subcategoryId);
        if (!updated) {
            throw new Error('RepositoryInvariantViolation: updated record not found');
        }
        return updated;
    }
    /**
     * Deletes a subcategory by ID.
     *
     * @summary Removes a subcategory record from the database.
     * @param subcategoryId - Subcategory ID to delete.
     */
    async delete(subcategoryId) {
        await db_1.db.delete(schema_1.subcategories).where((0, drizzle_orm_1.eq)(schema_1.subcategories.id, subcategoryId));
    }
}
exports.SubcategoryRepository = SubcategoryRepository;
