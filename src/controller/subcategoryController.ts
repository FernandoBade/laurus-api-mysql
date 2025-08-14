import { Request, Response, NextFunction } from 'express';
import { SubcategoryService } from '../service/subcategoryService';
import { createSubcategorySchema, updateSubcategorySchema } from '../model/subcategory/subcategorySchema';
import { validateSchema, formatZodValidationErrors, createLog, answerAPI, formatError } from '../utils/commons';
import { HTTPStatus, LogCategory, LogOperation, LogType } from '../utils/enum';
import { Resource } from '../utils/resources/resource';
import { LanguageCode } from '../utils/resources/resourceTypes';
import { parsePagination, buildMeta } from '../utils/pagination';

class SubcategoryController {
    /** @summary Creates a new subcategory using validated input from the request body.
     * Validates the category before proceeding and logs the result.
     *
     * @param req - Express request containing new subcategory data.
     * @param res - Express response returning the created subcategory.
     * @param next - Express next function for error handling.
     * @returns HTTP 201 with new subcategory data or appropriate error.
     */
    static async createSubcategory(req: Request, res: Response, next: NextFunction) {
        const subcategoryService = new SubcategoryService();

        try {
            const parseResult = validateSchema(createSubcategorySchema, req.body, req.language as LanguageCode);

            if (!parseResult.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, formatZodValidationErrors(parseResult.error), Resource.VALIDATION_ERROR);
            }

            const created = await subcategoryService.createSubcategory(parseResult.data, req.body.user_id);

            if (!created.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, created.error);
            }

            await createLog(LogType.SUCCESS, LogOperation.CREATE, LogCategory.CATEGORY, created.data, created.data!.category_id);
            return answerAPI(req, res, HTTPStatus.CREATED, created.data!);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.CREATE, LogCategory.CATEGORY, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retrieves all subcategories from the database.
     *
     * @param req - Express request object.
     * @param res - Express response with subcategory list.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with list or appropriate error.
     */
    static async getSubcategories(req: Request, res: Response, next: NextFunction) {
        const subcategoryService = new SubcategoryService();

        try {
            const { page, pageSize, limit, offset, sort, order } = parsePagination(req.query);
            const [rows, total] = await Promise.all([
                subcategoryService.getSubcategories({ limit, offset, sort, order }),
                subcategoryService.countSubcategories()
            ]);

            if (!rows.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, rows.error);
            }

            return answerAPI(req, res, HTTPStatus.OK, {
                data: rows.data,
                meta: buildMeta({ page, pageSize, total: total.data ?? 0 })
            });
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.CATEGORY, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retrieves all subcategories for a given category ID.
     * Validates the category ID before searching.
     *
     * @param req - Express request containing category ID.
     * @param res - Express response with the subcategory list.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with list or appropriate error.
     */
    static async getSubcategoriesByCategory(req: Request, res: Response, next: NextFunction) {
        const categoryId = Number(req.params.categoryId);
        if (isNaN(categoryId) || categoryId <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_CATEGORY_ID);
        }

        const subcategoryService = new SubcategoryService();

        try {
            const { page, pageSize, limit, offset, sort, order } = parsePagination(req.query);
            const [rows, total] = await Promise.all([
                subcategoryService.getSubcategoriesByCategory(categoryId, { limit, offset, sort, order }),
                subcategoryService.countSubcategoriesByCategory(categoryId)
            ]);

            if (!rows.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, rows.error);
            }

            return answerAPI(req, res, HTTPStatus.OK, {
                data: rows.data,
                meta: buildMeta({ page, pageSize, total: total.data ?? 0 })
            });
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.CATEGORY, formatError(error), categoryId, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retrieves a specific subcategory by ID.
     * Validates the ID before proceeding.
     *
     * @param req - Express request with subcategory ID.
     * @param res - Express response returning the subcategory or error.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with subcategory data or appropriate error.
     */
    static async getSubcategoryById(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_SUBCATEGORY_ID);
        }

        const subcategoryService = new SubcategoryService();

        try {
            const result = await subcategoryService.getSubcategoryById(id);

            if (!result.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, result.error);
            }

            return answerAPI(req, res, HTTPStatus.OK, result.data);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.CATEGORY, formatError(error), id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retrieves all subcategories associated with a specific user.
     * Validates the user ID and returns all subcategories from their categories.
     *
     * @param req - Express request with user ID in the URL.
     * @param res - Express response with the subcategories.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with subcategory list or appropriate error.
     */
    static async getSubcategoriesByUser(req: Request, res: Response, next: NextFunction) {
        const userId = Number(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_USER_ID);
        }

        const subcategoryService = new SubcategoryService();

        try {
            const { page, pageSize, limit, offset, sort, order } = parsePagination(req.query);
            const [rows, total] = await Promise.all([
                subcategoryService.getSubcategoriesByUser(userId, { limit, offset, sort, order }),
                subcategoryService.countSubcategoriesByUser(userId)
            ]);

            if (!rows.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, rows.error);
            }

            return answerAPI(req, res, HTTPStatus.OK, {
                data: rows.data,
                meta: buildMeta({ page, pageSize, total: total.data ?? 0 })
            });
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.CATEGORY, formatError(error), userId, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
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
    static async updateSubcategory(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_SUBCATEGORY_ID);
        }

        const subcategoryService = new SubcategoryService();

        try {
            const existing = await subcategoryService.getSubcategoryById(id);
            if (!existing.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, existing.error);
            }

            const parseResult = validateSchema(updateSubcategorySchema, req.body, req.language as LanguageCode);

            if (!parseResult.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, formatZodValidationErrors(parseResult.error), Resource.VALIDATION_ERROR);
            }

            const updated = await subcategoryService.updateSubcategory(id, parseResult.data, req.body.user_id);

            if (!updated.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, updated.error);
            }

            await createLog(LogType.SUCCESS, LogOperation.UPDATE, LogCategory.CATEGORY, updated.data, updated.data!.category_id);
            return answerAPI(req, res, HTTPStatus.OK, updated.data!);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.UPDATE, LogCategory.CATEGORY, formatError(error), id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Deletes a subcategory by its ID.
     * Validates the ID and logs the result on success.
     *
     * @param req - Express request with the ID to delete.
     * @param res - Express response confirming deletion or error.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with deleted ID or appropriate error.
     */
    static async deleteSubcategory(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id);

        if (isNaN(id) || id <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_SUBCATEGORY_ID);
        }

        const subcategoryService = new SubcategoryService();

        try {
            const result = await subcategoryService.deleteSubcategory(id);

            if (!result.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, result.error);
            }

            await createLog(LogType.SUCCESS, LogOperation.DELETE, LogCategory.CATEGORY, result.data, id);
            return answerAPI(req, res, HTTPStatus.OK, result.data);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.DELETE, LogCategory.CATEGORY, formatError(error), id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }
}

export default SubcategoryController;
