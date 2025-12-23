import { Request, Response, NextFunction } from 'express';
import { UserService } from '../service/userService';
import { createLog, answerAPI, formatError } from '../utils/commons';
import { LogCategory, HTTPStatus, LogOperation, LogType } from '../utils/enum';
import { validateCreateUser, validateUpdateUser } from '../utils/validation/validateRequest';
import { Resource } from '../utils/resources/resource';
import { LanguageCode } from '../utils/resources/resourceTypes';
import { parsePagination, buildMeta } from '../utils/pagination';


class UserController {
    /** @summary Creates a new user using validated input from the request body.
     * Logs the result and returns the created user on success.
     *
     * @param req - Express request containing new user data.
     * @param res - Express response returning the created user.
     * @param next - Express next function for error handling.
     * @returns HTTP 201 with new user data or appropriate error.
     */
    static async createUser(req: Request, res: Response, next: NextFunction) {
        const userService = new UserService();

        try {
            const parseResult = validateCreateUser(req.body, req.language as LanguageCode);

            if (!parseResult.success) {
                return answerAPI(
                    req,
                    res,
                    HTTPStatus.BAD_REQUEST,
                    parseResult.errors,
                    Resource.VALIDATION_ERROR
                );
            }

            const newUser = await userService.createUser(parseResult.data);

            if (!newUser.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, newUser.error);
            }

            await createLog(LogType.SUCCESS, LogOperation.CREATE, LogCategory.USER, newUser.data, newUser.data!.id);
            return answerAPI(req, res, HTTPStatus.CREATED, newUser.data!);
        } catch (error) {
            await createLog(
                LogType.ERROR,
                LogOperation.CREATE,
                LogCategory.USER,
                formatError(error),
                req.user?.id,
                next
            );
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
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
    static async getUsers(req: Request, res: Response, next: NextFunction) {
        const userService = new UserService();

        try {
            const { page, pageSize, limit, offset, sort, order } = parsePagination(req.query);
            const [rows, total] = await Promise.all([
                userService.getUsers({ limit, offset, sort, order }),
                userService.countUsers()
            ]);

            if (!rows.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, rows.error);
            }

            if (!total.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, total.error);
            }

            return answerAPI(req, res, HTTPStatus.OK, {
                data: rows.data,
                meta: buildMeta({ page, pageSize, total: total.data })
            });
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.USER, formatError(error), req.user?.id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
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
    static async getUserById(req: Request, res: Response, next: NextFunction) {
        const userId = Number(req.params.id);
        if (isNaN(userId) || userId <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_USER_ID);
        }

        const userService = new UserService();

        try {
            const user = await userService.getUserById(userId);
            if (!user.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, user.error);
            }

            return answerAPI(req, res, HTTPStatus.OK, user.data);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.USER, formatError(error), req.user?.id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
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
    static async getUsersByEmail(req: Request, res: Response, next: NextFunction) {
        const searchTerm = req.query.email as string;

        if (!searchTerm || searchTerm.length < 3) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.SEARCH_TERM_TOO_SHORT);
        }

        const userService = new UserService();

        try {
            const { page, pageSize, limit, offset, sort, order } = parsePagination(req.query);
            const [rows, total] = await Promise.all([
                userService.getUsersByEmail(searchTerm, { limit, offset, sort, order }),
                userService.countUsersByEmail(searchTerm)
            ]);

            if (!rows.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, rows.error);
            }

            if (!total.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, total.error);
            }

            return answerAPI(req, res, HTTPStatus.OK, {
                data: rows.data,
                meta: buildMeta({ page, pageSize, total: total.data })
            });
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.USER, formatError(error), req.user?.id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
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
    static async updateUser(req: Request, res: Response, next: NextFunction) {
        const userId = Number(req.params.id);
        if (isNaN(userId) || userId <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_USER_ID);
        }

        const userService = new UserService();

        try {
            const existingUser = await userService.findOne(userId);
            if (!existingUser.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, existingUser.error);
            }

            const parseResult = validateUpdateUser(req.body, req.language as LanguageCode);

            if (!parseResult.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, parseResult.errors, Resource.VALIDATION_ERROR);
            }

            const updatedUser = await userService.updateUser(userId, parseResult.data);
            if (!updatedUser.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, updatedUser.error);
            }

            await createLog(LogType.SUCCESS, LogOperation.UPDATE, LogCategory.USER, updatedUser.data, updatedUser.data!.id);
            return answerAPI(req, res, HTTPStatus.OK, updatedUser.data!);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.UPDATE, LogCategory.USER, formatError(error), req.user?.id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
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
    static async deleteUser(req: Request, res: Response, next: NextFunction) {
        const userId = Number(req.params.id);

        if (isNaN(userId) || userId <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_USER_ID);
        }

        const userService = new UserService();

        try {
            const result = await userService.deleteUser(userId);

            if (!result.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, result.error);
            }

            await createLog(LogType.SUCCESS, LogOperation.DELETE, LogCategory.USER, result.data, userId);
            return answerAPI(req, res, HTTPStatus.OK, result.data);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.DELETE, LogCategory.USER, formatError(error), req.user?.id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }
}

export default UserController;
