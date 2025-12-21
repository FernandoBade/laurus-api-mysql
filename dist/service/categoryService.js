"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const enum_1 = require("../utils/enum");
const categoryRepository_1 = require("../repositories/categoryRepository");
const userService_1 = require("./userService");
const resource_1 = require("../utils/resources/resource");
/**
 * Service for category business logic.
 * Handles category operations including validation and user linking.
 */
class CategoryService {
    constructor() {
        this.categoryRepository = new categoryRepository_1.CategoryRepository();
    }
    /**
     * Creates a new category linked to a valid user.
     *
     * @summary Creates a new category for a user.
     * @param data - Category creation data.
     * @returns The created category record.
     */
    async createCategory(data) {
        const userService = new userService_1.UserService();
        const user = await userService.getUserById(data.userId);
        if (!user.success || !user.data) {
            return { success: false, error: resource_1.Resource.USER_NOT_FOUND };
        }
        try {
            const created = await this.categoryRepository.create(Object.assign(Object.assign({}, data), { user_id: data.userId }));
            return { success: true, data: created };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Retrieves all category records from the database.
     *
     * @summary Gets all categories with optional pagination and sorting.
     * @param options - Query options for pagination and sorting.
     * @returns A list of all categories.
     */
    async getCategories(options) {
        try {
            const categories = await this.categoryRepository.findMany(undefined, {
                limit: options === null || options === void 0 ? void 0 : options.limit,
                offset: options === null || options === void 0 ? void 0 : options.offset,
                sort: options === null || options === void 0 ? void 0 : options.sort,
                order: (options === null || options === void 0 ? void 0 : options.order) === enum_1.Operator.DESC ? 'desc' : 'asc',
            });
            return { success: true, data: categories };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Counts all categories.
     *
     * @summary Gets total count of categories.
     * @returns Total category count.
     */
    async countCategories() {
        try {
            const count = await this.categoryRepository.count();
            return { success: true, data: count };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Retrieves a category by its ID.
     *
     * @summary Gets a category by ID.
     * @param id - ID of the category.
     * @returns The category if found.
     */
    async getCategoryById(id) {
        const category = await this.categoryRepository.findById(id);
        if (!category) {
            return { success: false, error: resource_1.Resource.NO_RECORDS_FOUND };
        }
        return { success: true, data: category };
    }
    /**
     * Retrieves all categories linked to a specific user.
     *
     * @summary Gets all categories for a user.
     * @param userId - ID of the user.
     * @returns A list of categories owned by the user.
     */
    async getCategoriesByUser(userId, options) {
        try {
            const categories = await this.categoryRepository.findMany({
                userId: { operator: enum_1.Operator.EQUAL, value: userId }
            }, {
                limit: options === null || options === void 0 ? void 0 : options.limit,
                offset: options === null || options === void 0 ? void 0 : options.offset,
                sort: options === null || options === void 0 ? void 0 : options.sort,
                order: (options === null || options === void 0 ? void 0 : options.order) === enum_1.Operator.DESC ? 'desc' : 'asc',
            });
            return { success: true, data: categories };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Counts categories belonging to a specific user.
     *
     * @summary Gets count of categories for a user.
     * @param userId - User ID.
     * @returns Count of user's categories.
     */
    async countCategoriesByUser(userId) {
        try {
            const count = await this.categoryRepository.count({
                userId: { operator: enum_1.Operator.EQUAL, value: userId }
            });
            return { success: true, data: count };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Updates a category by ID.
     * Validates the user if the userId is being changed.
     *
     * @summary Updates category data.
     * @param id - ID of the category.
     * @param data - Partial category data to update.
     * @returns Updated category record.
     */
    async updateCategory(id, data) {
        if (data.userId !== undefined) {
            const userService = new userService_1.UserService();
            const user = await userService.getUserById(data.userId);
            if (!user.success || !user.data) {
                return { success: false, error: resource_1.Resource.USER_NOT_FOUND };
            }
        }
        try {
            const updated = await this.categoryRepository.update(id, data);
            return { success: true, data: updated };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Deletes a category by ID after validating its existence.
     *
     * @summary Removes a category from the database.
     * @param id - ID of the category to delete.
     * @returns Success with deleted ID, or error if category does not exist.
     */
    async deleteCategory(id) {
        const existing = await this.categoryRepository.findById(id);
        if (!existing) {
            return { success: false, error: resource_1.Resource.CATEGORY_NOT_FOUND };
        }
        try {
            await this.categoryRepository.delete(id);
            return { success: true, data: { id } };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
}
exports.CategoryService = CategoryService;
