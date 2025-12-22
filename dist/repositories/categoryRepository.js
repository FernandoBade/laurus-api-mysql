"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
/**
 * Repository for category database operations.
 * Provides type-safe CRUD operations for categories using Drizzle ORM.
 */
class CategoryRepository {
    /**
     * Finds a category by its ID.
     *
     * @summary Retrieves a single category by ID.
     * @param categoryId - Category ID to search for.
     * @returns Category record if found, null otherwise.
     */
    async findById(categoryId) {
        const result = await db_1.db.select().from(schema_1.categories).where((0, drizzle_orm_1.eq)(schema_1.categories.id, categoryId)).limit(1);
        return result[0] || null;
    }
    /**
     * Finds multiple categories with optional filters and pagination.
     *
     * @summary Retrieves a list of categories with filtering and sorting.
     * @param filters - Optional filter conditions.
     * @param options - Optional pagination and sorting options.
     * @returns Array of category records.
     */
    async findMany(filters, options) {
        let query = db_1.db.select().from(schema_1.categories);
        const conditions = [];
        if (filters === null || filters === void 0 ? void 0 : filters.userId) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.categories.userId, filters.userId.value));
        }
        if (filters === null || filters === void 0 ? void 0 : filters.active) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.categories.active, filters.active.value));
        }
        if (conditions.length > 0) {
            query = query.where((0, drizzle_orm_1.and)(...conditions));
        }
        if (options === null || options === void 0 ? void 0 : options.sort) {
            const column = schema_1.categories[options.sort];
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
     * Counts categories matching optional filters.
     *
     * @summary Counts total categories matching filter criteria.
     * @param filters - Optional filter conditions.
     * @returns Total count of matching categories.
     */
    async count(filters) {
        let query = db_1.db.select({ count: schema_1.categories.id }).from(schema_1.categories);
        const conditions = [];
        if (filters === null || filters === void 0 ? void 0 : filters.userId) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.categories.userId, filters.userId.value));
        }
        if (filters === null || filters === void 0 ? void 0 : filters.active) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.categories.active, filters.active.value));
        }
        if (conditions.length > 0) {
            query = query.where((0, drizzle_orm_1.and)(...conditions));
        }
        const result = await query;
        return result.length;
    }
    /**
     * Creates a new category.
     *
     * @summary Inserts a new category record.
     * @param data - Category data to insert.
     * @returns The created category record with generated ID.
     */
    async create(data) {
        const result = await db_1.db.insert(schema_1.categories).values(data);
        const insertedId = result[0].insertId;
        const created = await this.findById(Number(insertedId));
        if (!created) {
            throw new Error('RepositoryInvariantViolation: created record not found');
        }
        return created;
    }
    /**
     * Updates an existing category by ID.
     *
     * @summary Updates category record with new data.
     * @param categoryId - Category ID to update.
     * @param data - Partial category data to update.
     * @returns The updated category record.
     */
    async update(categoryId, data) {
        await db_1.db.update(schema_1.categories).set(data).where((0, drizzle_orm_1.eq)(schema_1.categories.id, categoryId));
        const updated = await this.findById(categoryId);
        if (!updated) {
            throw new Error('RepositoryInvariantViolation: updated record not found');
        }
        return updated;
    }
    /**
     * Deletes a category by ID.
     *
     * @summary Removes a category record from the database.
     * @param categoryId - Category ID to delete.
     */
    async delete(categoryId) {
        await db_1.db.delete(schema_1.categories).where((0, drizzle_orm_1.eq)(schema_1.categories.id, categoryId));
    }
}
exports.CategoryRepository = CategoryRepository;
