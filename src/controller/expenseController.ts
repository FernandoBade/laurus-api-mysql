// #region Imports
import { Request, Response, NextFunction } from 'express';
import { ExpenseService } from '../service/expenseService';
import { createExpenseSchema, updateExpenseSchema } from '../model/expense/expenseSchema';
import { formatZodValidationErrors, createLog, answerAPI, formatError, validateSchema } from '../utils/commons';
import { HTTPStatus, LogCategory, LogOperation, LogType } from '../utils/enum';
import { Resource } from '../utils/resources/resource';
import { LanguageCode } from '../utils/resources/resourceTypes';
// #endregion Imports

class ExpenseController {
    /**
     * Creates a new expense using validated input from the request body.
     * Logs the result and returns the created expense on success.
     *
     * @param req - Express request containing new expense data.
     * @param res - Express response returning the created expense.
     * @param next - Express next function for error handling.
     * @returns HTTP 201 with new expense data or appropriate error.
     */
    static async createExpense(req: Request, res: Response, next: NextFunction) {
        const expenseService = new ExpenseService();

        try {

            const parseResult = validateSchema(createExpenseSchema, req.body, req.language as LanguageCode);

            if (!parseResult.success) {
                return answerAPI(
                    req,
                    res,
                    HTTPStatus.BAD_REQUEST,
                    formatZodValidationErrors(parseResult.error),
                    Resource.VALIDATION_ERROR
                );
            }

            const created = await expenseService.createExpense(parseResult.data);

            if (!created.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, created.error);
            }

            await createLog(LogType.SUCCESS, LogOperation.CREATE, LogCategory.EXPENSE, created.data, created.data.account_id);
            return answerAPI(req, res, HTTPStatus.CREATED, created.data);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.CREATE, LogCategory.EXPENSE, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retrieves all expenses from the database.
     * Validates the ID before querying.
     *
     * @param req - Express request object.
     * @param res - Express response returning the expense or an error.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with expense data or appropriate error. May be empty.
     */
    static async getExpenses(req: Request, res: Response, next: NextFunction) {
        const expenseService = new ExpenseService();

        try {
            const expenses = await expenseService.getExpenses();
            return answerAPI(req, res, HTTPStatus.OK, expenses.data, expenses.data?.length ? undefined : Resource.NO_RECORDS_FOUND);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.EXPENSE, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retrieves a specific expense by its ID.
     * Validates the ID before querying.
     *
     * @param req - Express request containing expense ID in the URL.
     * @param res - Express response returning the expense or an error.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with expense data or appropriate error.
     */
    static async getExpenseById(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_EXPENSE_ID);
        }

        const expenseService = new ExpenseService();

        try {
            const expense = await expenseService.getExpenseById(id);

            if (!expense.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, expense.error);
            }

            return answerAPI(req, res, HTTPStatus.OK, expense.data);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.EXPENSE, formatError(error), id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retrieves all expenses for a specific account.
     * Validates the account ID before querying.
     *
     * @param req - Express request with account ID in the URL.
     * @param res - Express response returning the list of expenses.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with expense list or appropriate error.
     */
    static async getExpensesByAccount(req: Request, res: Response, next: NextFunction) {
        const accountId = Number(req.params.accountId);
        if (isNaN(accountId) || accountId <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_ACCOUNT_ID);
        }

        const expenseService = new ExpenseService();

        try {
            const expenses = await expenseService.getExpensesByAccount(accountId);
            return answerAPI(req, res, HTTPStatus.OK, expenses.data, expenses.data?.length ? undefined : Resource.NO_RECORDS_FOUND);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.EXPENSE, formatError(error), accountId, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retrieves all expenses for a given user, grouped by account.
     * Validates the user ID before processing.
     *
     * @param req - Express request with user ID in the URL.
     * @param res - Express response returning the user's expenses.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with expense list or appropriate error.
     */
    static async getExpensesByUser(req: Request, res: Response, next: NextFunction) {
        const userId = Number(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_USER_ID);
        }

        const expenseService = new ExpenseService();

        try {
            const expenses = await expenseService.getExpensesByUser(userId);
            return answerAPI(req, res, HTTPStatus.OK, expenses.data, expenses.data?.length ? undefined : Resource.NO_RECORDS_FOUND);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.EXPENSE, formatError(error), userId, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Updates an existing expense by ID using validated input.
     * Ensures expense exists before updating and logs the operation.
     *
     * @param req - Express request with expense ID and updated data.
     * @param res - Express response returning the updated expense.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with updated expense or appropriate error.
     */
    static async updateExpense(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_EXPENSE_ID);
        }

        const expenseService = new ExpenseService();

        try {
            const existing = await expenseService.getExpenseById(id);
            if (!existing.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, existing.error);
            }

            const parseResult = validateSchema(updateExpenseSchema, req.body, req.language as LanguageCode);

            if (!parseResult.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, formatZodValidationErrors(parseResult.error), Resource.VALIDATION_ERROR);
            }

            const updated = await expenseService.updateExpense(id, parseResult.data);
            if (!updated.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, updated.error);
            }

            await createLog(LogType.SUCCESS, LogOperation.UPDATE, LogCategory.EXPENSE, updated.data, updated.data.account_id);
            return answerAPI(req, res, HTTPStatus.OK, updated.data);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.UPDATE, LogCategory.EXPENSE, formatError(error), id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Deletes an expense by its unique ID.
     * Validates the ID and logs the result upon successful deletion.
     *
     * @param req - Express request with the ID of the expense to delete.
     * @param res - Express response confirming deletion.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with deleted ID or appropriate error.
     */
    static async deleteExpense(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id);

        if (isNaN(id) || id <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_EXPENSE_ID);
        }

        const expenseService = new ExpenseService();

        try {
            const result = await expenseService.deleteExpense(id);

            if (!result.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, result.error);
            }

            await createLog(LogType.SUCCESS, LogOperation.DELETE, LogCategory.EXPENSE, result.data, result.data?.id);
            return answerAPI(req, res, HTTPStatus.OK, result.data);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.DELETE, LogCategory.EXPENSE, formatError(error), id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }
}

export default ExpenseController;
