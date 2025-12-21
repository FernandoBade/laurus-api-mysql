"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subcategoryService_1 = require("../service/subcategoryService");
const validateRequest_1 = require("../utils/validation/validateRequest");
const commons_1 = require("../utils/commons");
const enum_1 = require("../utils/enum");
const resource_1 = require("../utils/resources/resource");
const pagination_1 = require("../utils/pagination");
/** @summary Handles HTTP requests for subcategory resources. */
class SubcategoryController {
    /** @summary Creates a new subcategory using validated input from the request body.
     * Validates the category before proceeding and logs the result.
     *
     * @param req - Express request containing new subcategory data.
     * @param res - Express response returning the created subcategory.
     * @param next - Express next function for error handling.
     * @returns HTTP 201 with new subcategory data or appropriate error.
     */
    static async createSubcategory(req, res, next) {
        const subcategoryService = new subcategoryService_1.SubcategoryService();
        try {
            const parseResult = (0, validateRequest_1.validateCreateSubcategory)(req.body, req.language);
            if (!parseResult.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, parseResult.errors, resource_1.Resource.VALIDATION_ERROR);
            }
            const created = await subcategoryService.createSubcategory(parseResult.data, req.body.user_id);
            if (!created.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, created.error);
            }
            await (0, commons_1.createLog)(enum_1.LogType.SUCCESS, enum_1.LogOperation.CREATE, enum_1.LogCategory.CATEGORY, created.data, created.data.categoryId);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.CREATED, created.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.CREATE, enum_1.LogCategory.CATEGORY, (0, commons_1.formatError)(error), undefined, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Retrieves all subcategories from the database.
     *
     * @param req - Express request object.
     * @param res - Express response with subcategory list.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with list or appropriate error.
     */
    static async getSubcategories(req, res, next) {
        const subcategoryService = new subcategoryService_1.SubcategoryService();
        try {
            const { page, pageSize, limit, offset, sort, order } = (0, pagination_1.parsePagination)(req.query);
            const [rows, total] = await Promise.all([
                subcategoryService.getSubcategories({ limit, offset, sort, order }),
                subcategoryService.countSubcategories()
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
    /** @summary Retrieves all subcategories for a given category ID.
     * Validates the category ID before searching.
     *
     * @param req - Express request containing category ID.
     * @param res - Express response with the subcategory list.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with list or appropriate error.
     */
    static async getSubcategoriesByCategory(req, res, next) {
        const categoryId = Number(req.params.categoryId);
        if (isNaN(categoryId) || categoryId <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_CATEGORY_ID);
        }
        const subcategoryService = new subcategoryService_1.SubcategoryService();
        try {
            const { page, pageSize, limit, offset, sort, order } = (0, pagination_1.parsePagination)(req.query);
            const [rows, total] = await Promise.all([
                subcategoryService.getSubcategoriesByCategory(categoryId, { limit, offset, sort, order }),
                subcategoryService.countSubcategoriesByCategory(categoryId)
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
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.SEARCH, enum_1.LogCategory.CATEGORY, (0, commons_1.formatError)(error), categoryId, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Retrieves a specific subcategory by ID.
     * Validates the ID before proceeding.
     *
     * @param req - Express request with subcategory ID.
     * @param res - Express response returning the subcategory or error.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with subcategory data or appropriate error.
     */
    static async getSubcategoryById(req, res, next) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_SUBCATEGORY_ID);
        }
        const subcategoryService = new subcategoryService_1.SubcategoryService();
        try {
            const result = await subcategoryService.getSubcategoryById(id);
            if (!result.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, result.error);
            }
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK, result.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.SEARCH, enum_1.LogCategory.CATEGORY, (0, commons_1.formatError)(error), id, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Retrieves all subcategories associated with a specific user.
     * Validates the user ID and returns all subcategories from their categories.
     *
     * @param req - Express request with user ID in the URL.
     * @param res - Express response with the subcategories.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with subcategory list or appropriate error.
     */
    static async getSubcategoriesByUser(req, res, next) {
        const userId = Number(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_USER_ID);
        }
        const subcategoryService = new subcategoryService_1.SubcategoryService();
        try {
            const { page, pageSize, limit, offset, sort, order } = (0, pagination_1.parsePagination)(req.query);
            const [rows, total] = await Promise.all([
                subcategoryService.getSubcategoriesByUser(userId, { limit, offset, sort, order }),
                subcategoryService.countSubcategoriesByUser(userId)
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
    /** @summary Updates an existing subcategory by ID.
     * Validates input and logs the result.
     *
     * @param req - Express request with subcategory ID and data.
     * @param res - Express response with updated data or error.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with updated subcategory or appropriate error.
     */
    static async updateSubcategory(req, res, next) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_SUBCATEGORY_ID);
        }
        const subcategoryService = new subcategoryService_1.SubcategoryService();
        try {
            const existing = await subcategoryService.getSubcategoryById(id);
            if (!existing.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, existing.error);
            }
            const parseResult = (0, validateRequest_1.validateUpdateSubcategory)(req.body, req.language);
            if (!parseResult.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, parseResult.errors, resource_1.Resource.VALIDATION_ERROR);
            }
            const updated = await subcategoryService.updateSubcategory(id, parseResult.data, req.body.user_id);
            if (!updated.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, updated.error);
            }
            await (0, commons_1.createLog)(enum_1.LogType.SUCCESS, enum_1.LogOperation.UPDATE, enum_1.LogCategory.CATEGORY, updated.data, updated.data.categoryId);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK, updated.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.UPDATE, enum_1.LogCategory.CATEGORY, (0, commons_1.formatError)(error), id, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Deletes a subcategory by its ID.
     * Validates the ID and logs the result on success.
     *
     * @param req - Express request with the ID to delete.
     * @param res - Express response confirming deletion or error.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with deleted ID or appropriate error.
     */
    static async deleteSubcategory(req, res, next) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_SUBCATEGORY_ID);
        }
        const subcategoryService = new subcategoryService_1.SubcategoryService();
        try {
            const result = await subcategoryService.deleteSubcategory(id);
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
exports.default = SubcategoryController;
