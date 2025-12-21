"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userService_1 = require("../service/userService");
const commons_1 = require("../utils/commons");
const enum_1 = require("../utils/enum");
const validateRequest_1 = require("../utils/validation/validateRequest");
const resource_1 = require("../utils/resources/resource");
const pagination_1 = require("../utils/pagination");
class UserController {
    /** @summary Creates a new user using validated input from the request body.
     * Logs the result and returns the created user on success.
     *
     * @param req - Express request containing new user data.
     * @param res - Express response returning the created user.
     * @param next - Express next function for error handling.
     * @returns HTTP 201 with new user data or appropriate error.
     */
    static async createUser(req, res, next) {
        const userService = new userService_1.UserService();
        try {
            const parseResult = (0, validateRequest_1.validateCreateUser)(req.body, req.language);
            if (!parseResult.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, parseResult.errors, resource_1.Resource.VALIDATION_ERROR);
            }
            const newUser = await userService.createUser(parseResult.data);
            if (!newUser.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, newUser.error);
            }
            await (0, commons_1.createLog)(enum_1.LogType.SUCCESS, enum_1.LogOperation.CREATE, enum_1.LogCategory.USER, newUser.data, newUser.data.id);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.CREATED, newUser.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.CREATE, enum_1.LogCategory.USER, (0, commons_1.formatError)(error), undefined, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /**
     * Retrieves a list of all users in the database.
     *
     * @param req - Express request object.
     * @param res - Express response returning the user list or an error.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with user array or appropriate error. May be empty.
     */
    static async getUsers(req, res, next) {
        const userService = new userService_1.UserService();
        try {
            const { page, pageSize, limit, offset, sort, order } = (0, pagination_1.parsePagination)(req.query);
            const [rows, total] = await Promise.all([
                userService.getUsers({ limit, offset, sort, order }),
                userService.countUsers()
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
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.SEARCH, enum_1.LogCategory.USER, (0, commons_1.formatError)(error), undefined, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /**
     * Retrieves a specific user by ID.
     * Validates the ID, fetches the user, and handles missing or invalid input.
     *
     * @param req - Express request containing user ID in the URL.
     * @param res - Express response returning the user or an error.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with user data or appropriate error.
     */
    static async getUserById(req, res, next) {
        const userId = Number(req.params.id);
        if (isNaN(userId) || userId <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_USER_ID);
        }
        const userService = new userService_1.UserService();
        try {
            const user = await userService.getUserById(userId);
            if (!user.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, user.error);
            }
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK, user.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.SEARCH, enum_1.LogCategory.USER, (0, commons_1.formatError)(error), undefined, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /**
     * Searches users by partial email using a LIKE filter.
     * Requires a minimum of 3 characters for the search term.
     *
     * @param req - Express request with email in the query string.
     * @param res - Express response returning matched users.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with result set or appropriate error. May be empty.
     */
    static async getUsersByEmail(req, res, next) {
        const searchTerm = req.query.email;
        if (!searchTerm || searchTerm.length < 3) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.SEARCH_TERM_TOO_SHORT);
        }
        const userService = new userService_1.UserService();
        try {
            const { page, pageSize, limit, offset, sort, order } = (0, pagination_1.parsePagination)(req.query);
            const [rows, total] = await Promise.all([
                userService.getUsersByEmail(searchTerm, { limit, offset, sort, order }),
                userService.countUsersByEmail(searchTerm)
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
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.SEARCH, enum_1.LogCategory.USER, (0, commons_1.formatError)(error), undefined, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Updates an existing user by ID using validated input.
     * Ensures user exists before updating and logs the result.
     *
     * @param req - Express request with user ID and updated data.
     * @param res - Express response returning the updated user.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with updated user or appropriate error.
     */
    static async updateUser(req, res, next) {
        const userId = Number(req.params.id);
        if (isNaN(userId) || userId <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_USER_ID);
        }
        const userService = new userService_1.UserService();
        try {
            const existingUser = await userService.findOne(userId);
            if (!existingUser.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, existingUser.error);
            }
            const parseResult = (0, validateRequest_1.validateUpdateUser)(req.body, req.language);
            if (!parseResult.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, parseResult.errors, resource_1.Resource.VALIDATION_ERROR);
            }
            const updatedUser = await userService.updateUser(userId, parseResult.data);
            if (!updatedUser.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, updatedUser.error);
            }
            await (0, commons_1.createLog)(enum_1.LogType.SUCCESS, enum_1.LogOperation.UPDATE, enum_1.LogCategory.USER, updatedUser.data, updatedUser.data.id);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK, updatedUser.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.UPDATE, enum_1.LogCategory.USER, (0, commons_1.formatError)(error), userId, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /**
     * Deletes a user by their unique ID.
     * Validates the ID and logs the result upon successful deletion.
     *
     * @param req - Express request with the ID of the user to delete.
     * @param res - Express response confirming deletion.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with deleted ID or appropriate error.
     */
    static async deleteUser(req, res, next) {
        const userId = Number(req.params.id);
        if (isNaN(userId) || userId <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_USER_ID);
        }
        const userService = new userService_1.UserService();
        try {
            const result = await userService.deleteUser(userId);
            if (!result.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, result.error);
            }
            await (0, commons_1.createLog)(enum_1.LogType.SUCCESS, enum_1.LogOperation.DELETE, enum_1.LogCategory.USER, result.data, userId);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK, result.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.DELETE, enum_1.LogCategory.USER, (0, commons_1.formatError)(error), userId, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
}
exports.default = UserController;
