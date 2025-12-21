"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transactionService_1 = require("../service/transactionService");
const validateRequest_1 = require("../utils/validation/validateRequest");
const commons_1 = require("../utils/commons");
const enum_1 = require("../utils/enum");
const resource_1 = require("../utils/resources/resource");
const pagination_1 = require("../utils/pagination");
// #endregion Imports
/** @summary Handles HTTP requests for transaction resources. */
class TransactionController {
    /** @summary Creates a new transaction using validated input from the request body.
     * Logs the result and returns the created transaction on success.
     *
     * @param req - Express request containing new transaction data.
     * @param res - Express response returning the created transaction.
     * @param next - Express next function for error handling.
     * @returns HTTP 201 with new transaction data or appropriate error.
     */
    static async createTransaction(req, res, next) {
        var _a, _b, _c, _d;
        const transactionService = new transactionService_1.TransactionService();
        try {
            const parseResult = (0, validateRequest_1.validateCreateTransaction)(req.body, req.language);
            if (!parseResult.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, parseResult.errors, resource_1.Resource.VALIDATION_ERROR);
            }
            const created = await transactionService.createTransaction(parseResult.data);
            if (!created.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, created.error);
            }
            await (0, commons_1.createLog)(enum_1.LogType.SUCCESS, enum_1.LogOperation.CREATE, enum_1.LogCategory.TRANSACTION, created.data, (_d = (_b = (_a = created.data) === null || _a === void 0 ? void 0 : _a.accountId) !== null && _b !== void 0 ? _b : (_c = created.data) === null || _c === void 0 ? void 0 : _c.creditCardId) !== null && _d !== void 0 ? _d : undefined);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.CREATED, created.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.CREATE, enum_1.LogCategory.TRANSACTION, (0, commons_1.formatError)(error), undefined, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Retrieves all transactions from the database.
     * Validates the ID before querying.
     *
     * @param req - Express request object.
     * @param res - Express response returning the transaction or an error.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with transaction data or appropriate error. May be empty.
     */
    static async getTransactions(req, res, next) {
        const transactionService = new transactionService_1.TransactionService();
        try {
            const { page, pageSize, limit, offset, sort, order } = (0, pagination_1.parsePagination)(req.query);
            const [rows, total] = await Promise.all([
                transactionService.getTransactions({ limit, offset, sort, order }),
                transactionService.countTransactions()
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
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.SEARCH, enum_1.LogCategory.TRANSACTION, (0, commons_1.formatError)(error), undefined, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Retrieves a specific transaction by its ID.
     * Validates the ID before querying.
     *
     * @param req - Express request containing transaction ID in the URL.
     * @param res - Express response returning the transaction or an error.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with transaction data or appropriate error.
     */
    static async getTransactionById(req, res, next) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_TRANSACTION_ID);
        }
        const transactionService = new transactionService_1.TransactionService();
        try {
            const transaction = await transactionService.getTransactionById(id);
            if (!transaction.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, transaction.error);
            }
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK, transaction.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.SEARCH, enum_1.LogCategory.TRANSACTION, (0, commons_1.formatError)(error), id, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Retrieves all transactions for a specific account.
     * Validates the account ID before querying.
     *
     * @param req - Express request with account ID in the URL.
     * @param res - Express response returning the list of transactions.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with transaction list or appropriate error.
     */
    static async getTransactionsByAccount(req, res, next) {
        const accountId = Number(req.params.accountId);
        if (isNaN(accountId) || accountId <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_ACCOUNT_ID);
        }
        const transactionService = new transactionService_1.TransactionService();
        try {
            const { page, pageSize, limit, offset, sort, order } = (0, pagination_1.parsePagination)(req.query);
            const [rows, total] = await Promise.all([
                transactionService.getTransactionsByAccount(accountId, { limit, offset, sort, order }),
                transactionService.countTransactionsByAccount(accountId)
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
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.SEARCH, enum_1.LogCategory.TRANSACTION, (0, commons_1.formatError)(error), accountId, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Retrieves all transactions for a given user, grouped by account.
     * Validates the user ID before processing.
     *
     * @param req - Express request with user ID in the URL.
     * @param res - Express response returning the user's transactions.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with transaction list or appropriate error.
     */
    static async getTransactionsByUser(req, res, next) {
        const userId = Number(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_USER_ID);
        }
        const transactionService = new transactionService_1.TransactionService();
        try {
            const { page, pageSize, limit, offset, sort, order } = (0, pagination_1.parsePagination)(req.query);
            const [rows, total] = await Promise.all([
                transactionService.getTransactionsByUser(userId, { limit, offset, sort, order }),
                transactionService.countTransactionsByUser(userId)
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
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.SEARCH, enum_1.LogCategory.TRANSACTION, (0, commons_1.formatError)(error), userId, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
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
    static async updateTransaction(req, res, next) {
        var _a, _b, _c, _d;
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_TRANSACTION_ID);
        }
        const transactionService = new transactionService_1.TransactionService();
        try {
            const existing = await transactionService.getTransactionById(id);
            if (!existing.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, existing.error);
            }
            const parseResult = (0, validateRequest_1.validateUpdateTransaction)(req.body, req.language);
            if (!parseResult.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, parseResult.errors, resource_1.Resource.VALIDATION_ERROR);
            }
            const updated = await transactionService.updateTransaction(id, Object.assign(Object.assign({}, parseResult.data), { value: parseResult.data.value !== undefined ? parseResult.data.value.toString() : undefined }));
            if (!updated.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, updated.error);
            }
            await (0, commons_1.createLog)(enum_1.LogType.SUCCESS, enum_1.LogOperation.UPDATE, enum_1.LogCategory.TRANSACTION, updated.data, (_d = (_b = (_a = updated.data) === null || _a === void 0 ? void 0 : _a.accountId) !== null && _b !== void 0 ? _b : (_c = updated.data) === null || _c === void 0 ? void 0 : _c.creditCardId) !== null && _d !== void 0 ? _d : undefined);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK, updated.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.UPDATE, enum_1.LogCategory.TRANSACTION, (0, commons_1.formatError)(error), id, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Deletes a transaction by its unique ID.
     * Validates the ID and logs the result upon successful deletion.
     *
     * @param req - Express request with the ID of the transaction to delete.
     * @param res - Express response confirming deletion.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with deleted ID or appropriate error.
     */
    static async deleteTransaction(req, res, next) {
        var _a;
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_TRANSACTION_ID);
        }
        const transactionService = new transactionService_1.TransactionService();
        try {
            const result = await transactionService.deleteTransaction(id);
            if (!result.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, result.error);
            }
            await (0, commons_1.createLog)(enum_1.LogType.SUCCESS, enum_1.LogOperation.DELETE, enum_1.LogCategory.TRANSACTION, result.data, (_a = result.data) === null || _a === void 0 ? void 0 : _a.id);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK, result.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.DELETE, enum_1.LogCategory.TRANSACTION, (0, commons_1.formatError)(error), id, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
}
exports.default = TransactionController;
