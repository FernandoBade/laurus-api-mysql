"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const accountService_1 = require("../service/accountService");
const commons_1 = require("../utils/commons");
const validateRequest_1 = require("../utils/validation/validateRequest");
const enum_1 = require("../utils/enum");
const resource_1 = require("../utils/resources/resource");
const pagination_1 = require("../utils/pagination");
/** @summary Handles HTTP requests for account resources. */
class AccountController {
    /** @summary Creates a new financial account using validated input.
     * Logs the result and returns the created account on success.
     *
     * @param req - Express request containing account data.
     * @param res - Express response returning the created account.
     * @param next - Express next function for error handling.
     * @returns HTTP 201 with new account data or appropriate error.
     */
    static async createAccount(req, res, next) {
        const accountService = new accountService_1.AccountService();
        try {
            const parseResult = (0, validateRequest_1.validateCreateAccount)(req.body, req.language);
            if (!parseResult.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, parseResult.errors, resource_1.Resource.VALIDATION_ERROR);
            }
            const created = await accountService.createAccount(parseResult.data);
            if (!created.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, created.error);
            }
            await (0, commons_1.createLog)(enum_1.LogType.SUCCESS, enum_1.LogOperation.CREATE, enum_1.LogCategory.ACCOUNT, created.data, created.data.userId);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.CREATED, created.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.CREATE, enum_1.LogCategory.ACCOUNT, (0, commons_1.formatError)(error), undefined, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Retrieves all financial accounts from the database.
     *
     * @param req - Express request object.
     * @param res - Express response returning the account list or an error.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with account list or appropriate error. May be empty.
     */
    static async getAccounts(req, res, next) {
        const accountService = new accountService_1.AccountService();
        try {
            const { page, pageSize, limit, offset, sort, order } = (0, pagination_1.parsePagination)(req.query);
            const [rows, total] = await Promise.all([
                accountService.getAccounts({ limit, offset, sort, order }),
                accountService.countAccounts()
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
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.SEARCH, enum_1.LogCategory.ACCOUNT, (0, commons_1.formatError)(error), undefined, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Retrieves a specific account by its ID.
     * Validates the ID before querying.
     *
     * @param req - Express request containing account ID in the URL.
     * @param res - Express response returning the account or an error.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with account data or appropriate error.
     */
    static async getAccountById(req, res, next) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_ACCOUNT_ID);
        }
        const accountService = new accountService_1.AccountService();
        try {
            const account = await accountService.getAccountById(id);
            if (!account.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, account.error);
            }
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK, account.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.SEARCH, enum_1.LogCategory.ACCOUNT, (0, commons_1.formatError)(error), id, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Retrieves all accounts belonging to a specific user.
     * Validates the user ID before searching.
     *
     * @param req - Express request containing user ID in the URL.
     * @param res - Express response returning the user's accounts.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with account list or appropriate error. May be empty.
     */
    static async getAccountsByUser(req, res, next) {
        const userId = Number(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_USER_ID);
        }
        const accountService = new accountService_1.AccountService();
        try {
            const { page, pageSize, limit, offset, sort, order } = (0, pagination_1.parsePagination)(req.query);
            const [rows, total] = await Promise.all([
                accountService.getAccountsByUser(userId, { limit, offset, sort, order }),
                accountService.countAccountsByUser(userId)
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
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.SEARCH, enum_1.LogCategory.ACCOUNT, (0, commons_1.formatError)(error), userId, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Updates an existing account by ID using validated input.
     * Ensures account exists before updating and logs the operation.
     *
     * @param req - Express request with account ID and updated data.
     * @param res - Express response returning the updated account.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with updated account or appropriate error.
     */
    static async updateAccount(req, res, next) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_ACCOUNT_ID);
        }
        const accountService = new accountService_1.AccountService();
        try {
            const existing = await accountService.getAccountById(id);
            if (!existing.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, existing.error);
            }
            const parseResult = (0, validateRequest_1.validateUpdateAccount)(req.body, req.language);
            if (!parseResult.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, parseResult.errors, resource_1.Resource.VALIDATION_ERROR);
            }
            const updated = await accountService.updateAccount(id, parseResult.data);
            if (!updated.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, updated.error);
            }
            await (0, commons_1.createLog)(enum_1.LogType.SUCCESS, enum_1.LogOperation.UPDATE, enum_1.LogCategory.ACCOUNT, updated.data, updated.data.userId);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK, updated.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.UPDATE, enum_1.LogCategory.ACCOUNT, (0, commons_1.formatError)(error), id, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Deletes an account by its unique ID.
     * Validates the ID and logs the result upon successful deletion.
     *
     * @param req - Express request with the ID of the account to delete.
     * @param res - Express response confirming deletion.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with deleted ID or apropriate error.
     */
    static async deleteAccount(req, res, next) {
        var _a;
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_ACCOUNT_ID);
        }
        const accountService = new accountService_1.AccountService();
        try {
            const result = await accountService.deleteAccount(id);
            if (!result.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, result.error);
            }
            await (0, commons_1.createLog)(enum_1.LogType.SUCCESS, enum_1.LogOperation.DELETE, enum_1.LogCategory.ACCOUNT, result.data, (_a = result.data) === null || _a === void 0 ? void 0 : _a.id);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK, result.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.DELETE, enum_1.LogCategory.ACCOUNT, (0, commons_1.formatError)(error), id, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
}
exports.default = AccountController;
