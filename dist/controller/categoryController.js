"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const categoryService_1 = require("../service/categoryService");
const validateRequest_1 = require("../utils/validation/validateRequest");
const commons_1 = require("../utils/commons");
const enum_1 = require("../utils/enum");
const resource_1 = require("../utils/resources/resource");
const pagination_1 = require("../utils/pagination");
/** @summary Handles HTTP requests for category resources. */
class CategoryController {
    /** @summary Creates a new category using validated input from the request body.
     * Logs the result and returns the created category on success.
     *
     * @param req - Express request containing category data.
     * @param res - Express response returning the created category.
     * @param next - Express next function for error handling.
     * @returns HTTP 201 with category data or appropriate error.
     */
    static async createCategory(req, res, next) {
        const categoryService = new categoryService_1.CategoryService();
        try {
            const parseResult = (0, validateRequest_1.validateCreateCategory)(req.body, req.language);
            if (!parseResult.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, parseResult.errors, resource_1.Resource.VALIDATION_ERROR);
            }
            const created = await categoryService.createCategory(parseResult.data);
            if (!created.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, created.error);
            }
            await (0, commons_1.createLog)(enum_1.LogType.SUCCESS, enum_1.LogOperation.CREATE, enum_1.LogCategory.CATEGORY, created.data, created.data.userId);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.CREATED, created.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.CREATE, enum_1.LogCategory.CATEGORY, (0, commons_1.formatError)(error), undefined, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Retrieves all categories from the database.
     *
     * @param req - Express request object.
     * @param res - Express response returning the list of categories.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with category list or appropriate error.
     */
    static async getCategories(req, res, next) {
        const categoryService = new categoryService_1.CategoryService();
        try {
            const { page, pageSize, limit, offset, sort, order } = (0, pagination_1.parsePagination)(req.query);
            const [rows, total] = await Promise.all([
                categoryService.getCategories({ limit, offset, sort, order }),
                categoryService.countCategories()
            ]);
            if (!rows.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, rows.error);
            }
            if (!total.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, total.error);
            }
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK, {
                data: rows.data,
                meta: (0, pagination_1.buildMeta)({ page, pageSize, total: total.data })
            });
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.SEARCH, enum_1.LogCategory.CATEGORY, (0, commons_1.formatError)(error), undefined, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Retrieves a category by its unique ID.
     *
     * @param req - Express request with category ID in the URL.
     * @param res - Express response returning the category or error.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with category data or appropriate error.
     */
    static async getCategoryById(req, res, next) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_CATEGORY_ID);
        }
        const categoryService = new categoryService_1.CategoryService();
        try {
            const category = await categoryService.getCategoryById(id);
            if (!category.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, category.error);
            }
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK, category.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.SEARCH, enum_1.LogCategory.CATEGORY, (0, commons_1.formatError)(error), id, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Retrieves all categories for a specific user.
     * Validates the user ID before querying.
     *
     * @param req - Express request containing user ID.
     * @param res - Express response with user's categories.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with categories list or appropriate error. May be empty.
     */
    static async getCategoriesByUser(req, res, next) {
        const userId = Number(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_USER_ID);
        }
        const categoryService = new categoryService_1.CategoryService();
        try {
            const { page, pageSize, limit, offset, sort, order } = (0, pagination_1.parsePagination)(req.query);
            const [rows, total] = await Promise.all([
                categoryService.getCategoriesByUser(userId, { limit, offset, sort, order }),
                categoryService.countCategoriesByUser(userId)
            ]);
            if (!rows.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, rows.error);
            }
            if (!total.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, total.error);
            }
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK, {
                data: rows.data,
                meta: (0, pagination_1.buildMeta)({ page, pageSize, total: total.data })
            });
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.SEARCH, enum_1.LogCategory.CATEGORY, (0, commons_1.formatError)(error), userId, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Updates an existing category by ID.
     * Validates the input and ensures the category exists.
     *
     * @param req - Express request with category ID and update data.
     * @param res - Express response with updated category or error.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with updated category or appropriate error.
     */
    static async updateCategory(req, res, next) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_CATEGORY_ID);
        }
        const categoryService = new categoryService_1.CategoryService();
        try {
            const existing = await categoryService.getCategoryById(id);
            if (!existing.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, existing.error);
            }
            const parseResult = (0, validateRequest_1.validateUpdateCategory)(req.body, req.language);
            if (!parseResult.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, parseResult.errors, resource_1.Resource.VALIDATION_ERROR);
            }
            const updated = await categoryService.updateCategory(id, parseResult.data);
            if (!updated.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, updated.error);
            }
            await (0, commons_1.createLog)(enum_1.LogType.SUCCESS, enum_1.LogOperation.UPDATE, enum_1.LogCategory.CATEGORY, updated.data, updated.data.userId);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK, updated.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.UPDATE, enum_1.LogCategory.CATEGORY, (0, commons_1.formatError)(error), id, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Deletes a category by ID.
     * Validates the ID and logs the result on success.
     *
     * @param req - Express request with the ID of the category to delete.
     * @param res - Express response confirming deletion or error.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with deleted ID or appropriate error.
     */
    static async deleteCategory(req, res, next) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_CATEGORY_ID);
        }
        const categoryService = new categoryService_1.CategoryService();
        try {
            const result = await categoryService.deleteCategory(id);
            if (!result.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, result.error);
            }
            await (0, commons_1.createLog)(enum_1.LogType.SUCCESS, enum_1.LogOperation.DELETE, enum_1.LogCategory.CATEGORY, result.data, id);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK, result.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.DELETE, enum_1.LogCategory.CATEGORY, (0, commons_1.formatError)(error), id, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
}
exports.default = CategoryController;
