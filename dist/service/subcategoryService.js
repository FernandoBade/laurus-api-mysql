"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubcategoryService = void 0;
const enum_1 = require("../utils/enum");
const subcategoryRepository_1 = require("../repositories/subcategoryRepository");
const categoryService_1 = require("./categoryService");
const resource_1 = require("../utils/resources/resource");
/**
 * Service for subcategory business logic.
 * Handles subcategory operations including validation and category linking.
 */
class SubcategoryService {
    constructor() {
        this.subcategoryRepository = new subcategoryRepository_1.SubcategoryRepository();
    }
    /**
     * Creates a new subcategory.
     * Ensures the required data is present and linked to a valid and authorized category.
     *
     * @summary Creates a new subcategory for a category.
     * @param data - Subcategory creation data.
     * @param userId - Optional ID of the user performing the operation.
     * @returns The created subcategory record.
     */
    async createSubcategory(data, userId) {
        var _a;
        const categoryService = new categoryService_1.CategoryService();
        const category = await categoryService.getCategoryById(data.categoryId);
        if (!category.success || !((_a = category.data) === null || _a === void 0 ? void 0 : _a.active)) {
            return { success: false, error: resource_1.Resource.CATEGORY_NOT_FOUND_OR_INACTIVE };
        }
        if (userId !== undefined && category.data.userId !== userId) {
            return { success: false, error: resource_1.Resource.UNAUTHORIZED_OPERATION };
        }
        try {
            const created = await this.subcategoryRepository.create(Object.assign(Object.assign({}, data), { category_id: data.categoryId }));
            return { success: true, data: created };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Retrieves all subcategories from the database.
     *
     * @summary Gets all subcategories with optional pagination and sorting.
     * @param options - Query options for pagination and sorting.
     * @returns A list of all subcategories.
     */
    async getSubcategories(options) {
        try {
            const subcategories = await this.subcategoryRepository.findMany(undefined, {
                limit: options === null || options === void 0 ? void 0 : options.limit,
                offset: options === null || options === void 0 ? void 0 : options.offset,
                sort: options === null || options === void 0 ? void 0 : options.sort,
                order: (options === null || options === void 0 ? void 0 : options.order) === enum_1.Operator.DESC ? 'desc' : 'asc',
            });
            return { success: true, data: subcategories };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Counts all subcategories.
     *
     * @summary Gets total count of subcategories.
     * @returns Total subcategory count.
     */
    async countSubcategories() {
        try {
            const count = await this.subcategoryRepository.count();
            return { success: true, data: count };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Retrieves all subcategories for a given category ID.
     *
     * @summary Gets all subcategories for a category.
     * @param categoryId - ID of the parent category.
     * @returns A list of subcategories under the specified category.
     */
    async getSubcategoriesByCategory(categoryId, options) {
        try {
            const subcategories = await this.subcategoryRepository.findMany({
                categoryId: { operator: enum_1.Operator.EQUAL, value: categoryId }
            }, {
                limit: options === null || options === void 0 ? void 0 : options.limit,
                offset: options === null || options === void 0 ? void 0 : options.offset,
                sort: options === null || options === void 0 ? void 0 : options.sort,
                order: (options === null || options === void 0 ? void 0 : options.order) === enum_1.Operator.DESC ? 'desc' : 'asc',
            });
            return { success: true, data: subcategories };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Counts subcategories for a specific category.
     *
     * @summary Gets count of subcategories for a category.
     * @param categoryId - Category ID.
     * @returns Count of subcategories.
     */
    async countSubcategoriesByCategory(categoryId) {
        try {
            const count = await this.subcategoryRepository.count({
                categoryId: { operator: enum_1.Operator.EQUAL, value: categoryId }
            });
            return { success: true, data: count };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Retrieves a subcategory by its ID.
     *
     * @summary Gets a subcategory by ID.
     * @param id - ID of the subcategory.
     * @returns Subcategory record if found.
     */
    async getSubcategoryById(id) {
        const subcategory = await this.subcategoryRepository.findById(id);
        if (!subcategory) {
            return { success: false, error: resource_1.Resource.NO_RECORDS_FOUND };
        }
        return { success: true, data: subcategory };
    }
    /**
     * Retrieves all subcategories linked to any category of a specific user.
     *
     * @summary Gets all subcategories for a user's categories.
     * @param userId - ID of the user whose subcategories are being requested.
     * @returns A list of subcategories across all categories owned by the user.
     */
    async getSubcategoriesByUser(userId, options) {
        var _a;
        const categoryService = new categoryService_1.CategoryService();
        const userCategories = await categoryService.getCategoriesByUser(userId);
        if (!userCategories.success || !((_a = userCategories.data) === null || _a === void 0 ? void 0 : _a.length)) {
            return { success: false, error: resource_1.Resource.NO_RECORDS_FOUND };
        }
        const categoryIds = userCategories.data.map(c => c.id);
        try {
            const subcategories = await this.subcategoryRepository.findMany({
                categoryId: { operator: enum_1.Operator.EQUAL, value: categoryIds[0] }
            }, {
                limit: options === null || options === void 0 ? void 0 : options.limit,
                offset: options === null || options === void 0 ? void 0 : options.offset,
                sort: options === null || options === void 0 ? void 0 : options.sort,
                order: (options === null || options === void 0 ? void 0 : options.order) === enum_1.Operator.DESC ? 'desc' : 'asc',
            });
            const allSubcategories = await this.subcategoryRepository.findMany({
                categoryId: { operator: enum_1.Operator.IN, value: categoryIds }
            }, {
                limit: options === null || options === void 0 ? void 0 : options.limit,
                offset: options === null || options === void 0 ? void 0 : options.offset,
                sort: options === null || options === void 0 ? void 0 : options.sort,
                order: (options === null || options === void 0 ? void 0 : options.order) === enum_1.Operator.DESC ? 'desc' : 'asc',
            });
            return { success: true, data: allSubcategories };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Counts subcategories belonging to categories of a specific user.
     *
     * @summary Gets count of subcategories for a user's categories.
     * @param userId - User ID.
     * @returns Count of subcategories.
     */
    async countSubcategoriesByUser(userId) {
        var _a;
        const categoryService = new categoryService_1.CategoryService();
        const userCategories = await categoryService.getCategoriesByUser(userId);
        if (!userCategories.success || !((_a = userCategories.data) === null || _a === void 0 ? void 0 : _a.length)) {
            return { success: false, error: resource_1.Resource.NO_RECORDS_FOUND };
        }
        const categoryIds = userCategories.data.map(c => c.id);
        try {
            const total = await this.subcategoryRepository.count({
                categoryId: { operator: enum_1.Operator.IN, value: categoryIds }
            });
            return { success: true, data: total };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Updates a subcategory by ID.
     * Validates the category if the categoryId is being changed, including ownership.
     *
     * @summary Updates subcategory data.
     * @param id - ID of the subcategory.
     * @param data - Partial subcategory data to update.
     * @param userId - Optional ID of the user performing the operation.
     * @returns Updated subcategory record.
     */
    async updateSubcategory(id, data, userId) {
        var _a;
        if (data.categoryId !== undefined) {
            const categoryService = new categoryService_1.CategoryService();
            const category = await categoryService.getCategoryById(data.categoryId);
            if (!category.success || !((_a = category.data) === null || _a === void 0 ? void 0 : _a.active)) {
                return { success: false, error: resource_1.Resource.CATEGORY_NOT_FOUND_OR_INACTIVE };
            }
            if (userId !== undefined && category.data.userId !== userId) {
                return { success: false, error: resource_1.Resource.UNAUTHORIZED_OPERATION };
            }
        }
        try {
            const updated = await this.subcategoryRepository.update(id, data);
            return { success: true, data: updated };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Deletes a subcategory by ID after verifying its existence.
     *
     * @summary Removes a subcategory from the database.
     * @param id - ID of the subcategory.
     * @returns Success with deleted ID, or error if subcategory does not exist.
     */
    async deleteSubcategory(id) {
        const existing = await this.subcategoryRepository.findById(id);
        if (!existing) {
            return { success: false, error: resource_1.Resource.SUBCATEGORY_NOT_FOUND };
        }
        try {
            await this.subcategoryRepository.delete(id);
            return { success: true, data: { id } };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
}
exports.SubcategoryService = SubcategoryService;
