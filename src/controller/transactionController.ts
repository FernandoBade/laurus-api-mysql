// #region Imports
import { Request, Response, NextFunction } from 'express';
import { TransactionService } from '../service/transactionService';
import { createTransactionSchema, updateTransactionSchema } from '../model/transaction/transactionSchema';
import { formatZodValidationErrors, createLog, answerAPI, formatError, validateSchema } from '../utils/commons';
import { HTTPStatus, LogCategory, LogOperation, LogType } from '../utils/enum';
import { Resource } from '../utils/resources/resource';
import { LanguageCode } from '../utils/resources/resourceTypes';
import { parsePagination, buildMeta } from '../utils/pagination';
// #endregion Imports

class TransactionController {
    /** @summary Creates a new transaction using validated input from the request body.
     * Logs the result and returns the created transaction on success.
     *
     * @param req - Express request containing new transaction data.
     * @param res - Express response returning the created transaction.
     * @param next - Express next function for error handling.
     * @returns HTTP 201 with new transaction data or appropriate error.
     */
    static async createTransaction(req: Request, res: Response, next: NextFunction) {
        const transactionService = new TransactionService();

        try {

            const parseResult = validateSchema(createTransactionSchema, req.body, req.language as LanguageCode);

            if (!parseResult.success) {
                return answerAPI(
                    req,
                    res,
                    HTTPStatus.BAD_REQUEST,
                    formatZodValidationErrors(parseResult.error),
                    Resource.VALIDATION_ERROR
                );
            }

            const created = await transactionService.createTransaction(parseResult.data);

            if (!created.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, created.error);
            }

            await createLog(
                LogType.SUCCESS,
                LogOperation.CREATE,
                LogCategory.TRANSACTION,
                created.data,
                created.data!.account_id ?? created.data!.credit_card_id
            );
            return answerAPI(req, res, HTTPStatus.CREATED, created.data!);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.CREATE, LogCategory.TRANSACTION, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retrieves all transactions from the database.
     * Validates the ID before querying.
     *
     * @param req - Express request object.
     * @param res - Express response returning the transaction or an error.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with transaction data or appropriate error. May be empty.
     */
    static async getTransactions(req: Request, res: Response, next: NextFunction) {
        const transactionService = new TransactionService();

        try {
            const { page, pageSize, limit, offset, sort, order } = parsePagination(req.query);
            const [rows, total] = await Promise.all([
                transactionService.getTransactions({ limit, offset, sort, order }),
                transactionService.countTransactions()
            ]);

            if (!rows.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, rows.error);
            }

            return answerAPI(req, res, HTTPStatus.OK, {
                data: rows.data,
                meta: buildMeta({ page, pageSize, total: total.data ?? 0 })
            });
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.TRANSACTION, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retrieves a specific transaction by its ID.
     * Validates the ID before querying.
     *
     * @param req - Express request containing transaction ID in the URL.
     * @param res - Express response returning the transaction or an error.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with transaction data or appropriate error.
     */
    static async getTransactionById(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_TRANSACTION_ID);
        }

        const transactionService = new TransactionService();

        try {
            const transaction = await transactionService.getTransactionById(id);

            if (!transaction.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, transaction.error);
            }

            return answerAPI(req, res, HTTPStatus.OK, transaction.data);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.TRANSACTION, formatError(error), id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retrieves all transactions for a specific account.
     * Validates the account ID before querying.
     *
     * @param req - Express request with account ID in the URL.
     * @param res - Express response returning the list of transactions.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with transaction list or appropriate error.
     */
    static async getTransactionsByAccount(req: Request, res: Response, next: NextFunction) {
        const accountId = Number(req.params.accountId);
        if (isNaN(accountId) || accountId <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_ACCOUNT_ID);
        }

        const transactionService = new TransactionService();

        try {
            const { page, pageSize, limit, offset, sort, order } = parsePagination(req.query);
            const [rows, total] = await Promise.all([
                transactionService.getTransactionsByAccount(accountId, { limit, offset, sort, order }),
                transactionService.countTransactionsByAccount(accountId)
            ]);

            if (!rows.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, rows.error);
            }

            return answerAPI(req, res, HTTPStatus.OK, {
                data: rows.data,
                meta: buildMeta({ page, pageSize, total: total.data ?? 0 })
            });
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.TRANSACTION, formatError(error), accountId, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retrieves all transactions for a given user, grouped by account.
     * Validates the user ID before processing.
     *
     * @param req - Express request with user ID in the URL.
     * @param res - Express response returning the user's transactions.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with transaction list or appropriate error.
     */
    static async getTransactionsByUser(req: Request, res: Response, next: NextFunction) {
        const userId = Number(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_USER_ID);
        }

        const transactionService = new TransactionService();

        try {
            const { page, pageSize, limit, offset, sort, order } = parsePagination(req.query);
            const [rows, total] = await Promise.all([
                transactionService.getTransactionsByUser(userId, { limit, offset, sort, order }),
                transactionService.countTransactionsByUser(userId)
            ]);

            if (!rows.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, rows.error);
            }

            return answerAPI(req, res, HTTPStatus.OK, {
                data: rows.data,
                meta: buildMeta({ page, pageSize, total: total.data ?? 0 })
            });
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.TRANSACTION, formatError(error), userId, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /** @summary Updates an existing transaction by ID using validated input.
     * Ensures transaction exists before updating and logs the operation.
     *
     * @param req - Express request with transaction ID and updated data.
     * @param res - Express response returning the updated transaction.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with updated transaction or appropriate error.
     */
    static async updateTransaction(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_TRANSACTION_ID);
        }

        const transactionService = new TransactionService();

        try {
            const existing = await transactionService.getTransactionById(id);
            if (!existing.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, existing.error);
            }

            const parseResult = validateSchema(updateTransactionSchema, req.body, req.language as LanguageCode);

            if (!parseResult.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, formatZodValidationErrors(parseResult.error), Resource.VALIDATION_ERROR);
            }

            const updated = await transactionService.updateTransaction(id, parseResult.data);
            if (!updated.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, updated.error);
            }

            await createLog(
                LogType.SUCCESS,
                LogOperation.UPDATE,
                LogCategory.TRANSACTION,
                updated.data,
                updated.data!.account_id ?? updated.data!.credit_card_id
            );
            return answerAPI(req, res, HTTPStatus.OK, updated.data!);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.UPDATE, LogCategory.TRANSACTION, formatError(error), id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Deletes an transaction by its unique ID.
     * Validates the ID and logs the result upon successful deletion.
     *
     * @param req - Express request with the ID of the transaction to delete.
     * @param res - Express response confirming deletion.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with deleted ID or appropriate error.
     */
    static async deleteTransaction(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id);

        if (isNaN(id) || id <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_TRANSACTION_ID);
        }

        const transactionService = new TransactionService();

        try {
            const result = await transactionService.deleteTransaction(id);

            if (!result.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, result.error);
            }

            await createLog(LogType.SUCCESS, LogOperation.DELETE, LogCategory.TRANSACTION, result.data, result.data?.id);
            return answerAPI(req, res, HTTPStatus.OK, result.data);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.DELETE, LogCategory.TRANSACTION, formatError(error), id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }
}

export default TransactionController;
