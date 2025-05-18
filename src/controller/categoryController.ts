import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../service/categoryService';
import { createCategorySchema, updateCategorySchema } from '../model/category/categorySchema';
import { validateSchema, formatZodValidationErrors, createLog, answerAPI, formatError } from '../utils/commons';
import { HTTPStatus, LogCategory, LogOperation, LogType } from '../utils/enum';
import { Resource } from '../utils/resources/resource';
import { LanguageCode } from '../utils/resources/resourceTypes';

class CategoryController {
    /**
     * Creates a new category using validated input from the request body.
     * Logs the result and returns the created category on success.
     *
     * @param req - Express request containing category data.
     * @param res - Express response returning the created category.
     * @param next - Express next function for error handling.
     * @returns HTTP 201 with category data or appropriate error.
     */
    static async createCategory(req: Request, res: Response, next: NextFunction) {
        const categoryService = new CategoryService();

        try {
            const parseResult = validateSchema(createCategorySchema, req.body, req.language as LanguageCode);

            if (!parseResult.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, formatZodValidationErrors(parseResult.error), Resource.VALIDATION_ERROR);
            }

            const created = await categoryService.createCategory(parseResult.data);

            if (!created.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, created.error);
            }

            await createLog(LogType.SUCCESS, LogOperation.CREATE, LogCategory.CATEGORY, created.data, created.data.user_id);
            return answerAPI(req, res, HTTPStatus.CREATED, created.data);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.CREATE, LogCategory.CATEGORY, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retrieves all categories from the database.
     *
     * @param req - Express request object.
     * @param res - Express response returning the list of categories.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with category list or appropriate error.
     */
    static async getCategories(req: Request, res: Response, next: NextFunction) {
        const categoryService = new CategoryService();

        try {
            const categories = await categoryService.getCategories();
            return answerAPI(req, res, HTTPStatus.OK, categories.data, categories.data?.length ? undefined : Resource.NO_RECORDS_FOUND);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.CATEGORY, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retrieves a category by its unique ID.
     *
     * @param req - Express request with category ID in the URL.
     * @param res - Express response returning the category or error.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with category data or appropriate error.
     */
    static async getCategoryById(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_CATEGORY_ID);
        }

        const categoryService = new CategoryService();

        try {
            const category = await categoryService.getCategoryById(id);

            if (!category.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, category.error);
            }

            return answerAPI(req, res, HTTPStatus.OK, category.data);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.CATEGORY, formatError(error), id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retrieves all categories for a specific user.
     * Validates the user ID before querying.
     *
     * @param req - Express request containing user ID.
     * @param res - Express response with user's categories.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with categories list or appropriate error. May be empty.
     */
    static async getCategoriesByUser(req: Request, res: Response, next: NextFunction) {
        const userId = Number(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_USER_ID);
        }

        const categoryService = new CategoryService();

        try {
            const result = await categoryService.getCategoriesByUser(userId);
            return answerAPI(req, res, HTTPStatus.OK, result.data, result.data?.length ? undefined : Resource.NO_RECORDS_FOUND);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.CATEGORY, formatError(error), userId, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Updates an existing category by ID.
     * Validates the input and ensures the category exists.
     *
     * @param req - Express request with category ID and update data.
     * @param res - Express response with updated category or error.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with updated category or appropriate error.
     */
    static async updateCategory(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_CATEGORY_ID);
        }

        const categoryService = new CategoryService();

        try {
            const existing = await categoryService.getCategoryById(id);
            if (!existing.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, existing.error);
            }

            const parseResult = validateSchema(updateCategorySchema, req.body, req.language as LanguageCode);
            if (!parseResult.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, formatZodValidationErrors(parseResult.error), Resource.VALIDATION_ERROR);
            }

            const updated = await categoryService.updateCategory(id, parseResult.data);
            if (!updated.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, updated.error);
            }

            await createLog(LogType.SUCCESS, LogOperation.UPDATE, LogCategory.CATEGORY, updated.data, updated.data.user_id);
            return answerAPI(req, res, HTTPStatus.OK, updated.data);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.UPDATE, LogCategory.CATEGORY, formatError(error), id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Deletes a category by ID.
     * Validates the ID and logs the result on success.
     *
     * @param req - Express request with the ID of the category to delete.
     * @param res - Express response confirming deletion or error.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with deleted ID or appropriate error.
     */
    static async deleteCategory(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_CATEGORY_ID);
        }

        const categoryService = new CategoryService();

        try {
            const result = await categoryService.deleteCategory(id);

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

export default CategoryController;
