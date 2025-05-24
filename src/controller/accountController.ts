import { Request, Response, NextFunction } from 'express';
import { AccountService } from '../service/accountService';
import { formatZodValidationErrors, createLog, answerAPI, formatError, validateSchema } from '../utils/commons';
import { createAccountSchema, updateAccountSchema } from '../model/account/accountSchema';
import { LogCategory, HTTPStatus, LogOperation, LogType } from '../utils/enum';
import { Resource } from '../utils/resources/resource';
import { LanguageCode } from '../utils/resources/resourceTypes';

class AccountController {
    /**
     * Creates a new financial account using validated input.
     * Logs the result and returns the created account on success.
     *
     * @param req - Express request containing account data.
     * @param res - Express response returning the created account.
     * @param next - Express next function for error handling.
     * @returns HTTP 201 with new account data or appropriate error.
     */
    static async createAccount(req: Request, res: Response, next: NextFunction) {
        const accountService = new AccountService();

        try {

            const parseResult = validateSchema(createAccountSchema, req.body, req.language as LanguageCode);

            if (!parseResult.success) {
                return answerAPI(
                    req,
                    res,
                    HTTPStatus.BAD_REQUEST,
                    formatZodValidationErrors(parseResult.error, ),
                    Resource.VALIDATION_ERROR
                );
            }

            const created = await accountService.createAccount(parseResult.data);

            if (!created.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, created.error);
            }

            await createLog(LogType.SUCCESS, LogOperation.CREATE, LogCategory.ACCOUNT, created.data, created.data.user_id);
            return answerAPI(req, res, HTTPStatus.CREATED, created.data);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.CREATE, LogCategory.ACCOUNT, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retrieves all financial accounts from the database.
     *
     * @param req - Express request object.
     * @param res - Express response returning the account list or an error.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with account list or appropriate error. May be empty.
     */
    static async getAccounts(req: Request, res: Response, next: NextFunction) {
        const accountService = new AccountService();

        try {
            const accounts = await accountService.getAccounts();
            return answerAPI(
                req,
                res,
                HTTPStatus.OK,
                accounts.data,
                accounts.data?.length ? undefined : Resource.NO_RECORDS_FOUND
            );
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.ACCOUNT, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retrieves a specific account by its ID.
     * Validates the ID before querying.
     *
     * @param req - Express request containing account ID in the URL.
     * @param res - Express response returning the account or an error.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with account data or appropriate error.
     */
    static async getAccountById(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_ACCOUNT_ID);
        }

        const accountService = new AccountService();

        try {
            const account = await accountService.getAccountById(id);

            if (!account.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, account.error);
            }

            return answerAPI(req, res, HTTPStatus.OK, account.data);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.ACCOUNT, formatError(error), id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retrieves all accounts belonging to a specific user.
     * Validates the user ID before searching.
     *
     * @param req - Express request containing user ID in the URL.
     * @param res - Express response returning the user's accounts.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with account list or appropriate error. May be empty.
     */
    static async getAccountsByUser(req: Request, res: Response, next: NextFunction) {
        const userId = Number(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_USER_ID);
        }

        const accountService = new AccountService();

        try {
            const accounts = await accountService.getAccountsByUser(userId);
            return answerAPI(
                req,
                res,
                HTTPStatus.OK,
                accounts.data,
                accounts.data?.length ? undefined : Resource.NO_RECORDS_FOUND
            );
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.ACCOUNT, formatError(error), userId, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Updates an existing account by ID using validated input.
     * Ensures account exists before updating and logs the operation.
     *
     * @param req - Express request with account ID and updated data.
     * @param res - Express response returning the updated account.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with updated account or appropriate error.
     */
    static async updateAccount(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_ACCOUNT_ID);
        }

        const accountService = new AccountService();

        try {
            const existing = await accountService.getAccountById(id);
            if (!existing.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, existing.error);
            }

            const parseResult = validateSchema(updateAccountSchema, req.body, req.language as LanguageCode);

            if (!parseResult.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, formatZodValidationErrors(parseResult.error), Resource.VALIDATION_ERROR);
            }

            const updated = await accountService.updateAccount(id, parseResult.data);
            if (!updated.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, updated.error);
            }

            await createLog(LogType.SUCCESS, LogOperation.UPDATE, LogCategory.ACCOUNT, updated.data, updated.data.user_id);
            return answerAPI(req, res, HTTPStatus.OK, updated.data);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.UPDATE, LogCategory.ACCOUNT, formatError(error), id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Deletes an account by its unique ID.
     * Validates the ID and logs the result upon successful deletion.
     *
     * @param req - Express request with the ID of the account to delete.
     * @param res - Express response confirming deletion.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with deleted ID or apropriate error.
     */
    static async deleteAccount(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id);

        if (isNaN(id) || id <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_ACCOUNT_ID);
        }

        const accountService = new AccountService();

        try {
            const result = await accountService.deleteAccount(id);

            if (!result.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, result.error);
            }

            await createLog(LogType.SUCCESS, LogOperation.DELETE, LogCategory.ACCOUNT, result.data, result.data?.id);
            return answerAPI(req, res, HTTPStatus.OK, result.data);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.DELETE, LogCategory.ACCOUNT, formatError(error), id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }
}

export default AccountController;
