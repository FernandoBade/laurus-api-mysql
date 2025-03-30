import { Request, Response, NextFunction } from 'express';
import { UserService } from '../service/userService';
import { formatZodValidationErrors, createLog, answerAPI, formatError } from '../utils/commons';
import { LogCategory, HTTPStatus, Operation, LogType, ErrorMessages } from '../utils/enum';
import { createUserSchema, updateUserSchema } from '../model/user/userSchema';

class UserController {
    /**
     * Creates a new user.
     * @param req - HTTP request containing user data.
     * @param res - HTTP response object.
     * @param next - Express middleware for error handling.
     */
    static async createUser(req: Request, res: Response, next: NextFunction) {
        const userService = new UserService();

        try {
            const parseResult = createUserSchema.safeParse(req.body);

            if (!parseResult.success) {
                return answerAPI(
                    res,
                    HTTPStatus.BAD_REQUEST,
                    formatZodValidationErrors(parseResult.error),
                    ErrorMessages.VALIDATION_ERROR
                );
            }

            const newUser = await userService.createUser(parseResult.data);

            if (!newUser.success) {
                return answerAPI(res, HTTPStatus.BAD_REQUEST, undefined, newUser.error);
            }

            await createLog(LogType.SUCCESS, Operation.CREATE, LogCategory.USER, newUser.data, newUser.data.id);
            return answerAPI(res, HTTPStatus.CREATED, newUser.data);
        } catch (error) {
            await createLog(
                LogType.ERROR,
                Operation.CREATE,
                LogCategory.USER,
                formatError(error),
                undefined,
                next
            );
            return answerAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, ErrorMessages.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Fetches all registered users.
     */
    static async getUsers(req: Request, res: Response, next: NextFunction) {
        const userService = new UserService();

        try {
            const usersFound = await userService.getUsers();
            return answerAPI(res, HTTPStatus.OK, usersFound.data, usersFound.data?.length ? undefined : ErrorMessages.NO_RECORDS_FOUND);
        } catch (error) {
            await createLog(LogType.ERROR, Operation.SEARCH, LogCategory.USER, formatError(error), undefined, next);
            return answerAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, ErrorMessages.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retrieves a specific user by ID.
     */
    static async getUserById(req: Request, res: Response, next: NextFunction) {
        const userId = Number(req.params.id);
        if (isNaN(userId) || userId <= 0) {
            return answerAPI(res, HTTPStatus.BAD_REQUEST, undefined, ErrorMessages.INVALID_USER_ID);
        }

        const userService = new UserService();

        try {
            const user = await userService.getUserById(userId);
            if (!user.success) {
                return answerAPI(res, HTTPStatus.BAD_REQUEST, undefined, user.error);
            }

            return answerAPI(res, HTTPStatus.OK, user.data);
        } catch (error) {
            await createLog(LogType.ERROR, Operation.SEARCH, LogCategory.USER, formatError(error), undefined, next);
            return answerAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, ErrorMessages.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Searches for users by email using a partial match (LIKE query).
     */
    static async getUsersByEmail(req: Request, res: Response, next: NextFunction) {
        const searchTerm = req.query.email as string;

        if (!searchTerm || searchTerm.length < 3) {
            return answerAPI(res, HTTPStatus.BAD_REQUEST, undefined, ErrorMessages.SEARCH_TERM_TOO_SHORT);
        }

        const userService = new UserService();

        try {
            const usersFound = await userService.getUsersByEmail(searchTerm);
            return answerAPI(res, HTTPStatus.OK, usersFound.data, usersFound.data?.length ? undefined : ErrorMessages.NO_RECORDS_FOUND);
        } catch (error) {
            await createLog(LogType.ERROR, Operation.SEARCH, LogCategory.USER, formatError(error), undefined, next);
            return answerAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, ErrorMessages.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Updates an existing user by ID.
     */
    static async updateUser(req: Request, res: Response, next: NextFunction) {
        const userId = Number(req.params.id);
        if (isNaN(userId) || userId <= 0) {
            return answerAPI(res, HTTPStatus.BAD_REQUEST, undefined, ErrorMessages.INVALID_USER_ID);
        }

        const userService = new UserService();

        const existingUser = await userService.findOne(userId);

        if (existingUser.error) {
            return answerAPI(res, HTTPStatus.BAD_REQUEST, undefined, existingUser.error);
        }

        try {
            const parseResult = updateUserSchema.safeParse(req.body);

            if (!parseResult.success) {
                return answerAPI(res, HTTPStatus.BAD_REQUEST, formatZodValidationErrors(parseResult.error), ErrorMessages.VALIDATION_ERROR);
            }

            const updatedUser = await userService.updateUser(userId, parseResult.data);
            if (!updatedUser.success) {
                return answerAPI(res, HTTPStatus.BAD_REQUEST, undefined, updatedUser.error);
            }

            await createLog(LogType.SUCCESS, Operation.UPDATE, LogCategory.USER, updatedUser.data, updatedUser.data.id);
            return answerAPI(res, HTTPStatus.OK, updatedUser.data);
        } catch (error) {
            await createLog(LogType.ERROR, Operation.UPDATE, LogCategory.USER, formatError(error), userId, next);
            return answerAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, ErrorMessages.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Permanently removes a user by ID.
     * @param req - HTTP request object.
     * @param res - HTTP response object.
     * @param next - Express middleware for error handling.
     */
    static async deleteUser(req: Request, res: Response, next: NextFunction) {
        const userId = Number(req.params.id);

        if (isNaN(userId) || userId <= 0) {
            return answerAPI(res, HTTPStatus.BAD_REQUEST, undefined, ErrorMessages.INVALID_USER_ID);
        }

        const userService = new UserService();

        try {
            const result = await userService.deleteUser(userId);

            if (!result.success) {
                return answerAPI(res, HTTPStatus.BAD_REQUEST, undefined, result.error);
            }

            await createLog(LogType.SUCCESS, Operation.DELETE, LogCategory.USER, result.data, userId);
            return answerAPI(res, HTTPStatus.OK, result.data);
        } catch (error) {
            await createLog(LogType.ERROR, Operation.DELETE, LogCategory.USER, formatError(error), userId, next);
            return answerAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, ErrorMessages.INTERNAL_SERVER_ERROR);
        }
    }

}

export default UserController;
