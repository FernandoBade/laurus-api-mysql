import { Request, Response, NextFunction } from 'express';
import { UserService } from '../service/userService';
import { formatZodValidationErrors, createLog, answerAPI, formatError } from '../utils/commons';
import { LogCategory, HTTPStatus, LogOperation, LogType } from '../utils/enum';
import { createUserSchema, updateUserSchema } from '../utils/validator';

class UserController {
    /**
     * Creates a new user.
    * @param req - HTTP request containing user data.
    * @param res - HTTP response object.
    * @param next - Express middleware for error handling.
     */
    static async createUser(req: Request, res: Response, next: NextFunction) {
        const userService = new UserService();
        const userData = req.body;

        try {
            const parseResult = createUserSchema.safeParse(userData);

            if (!parseResult.success) {
                return answerAPI(
                    res,
                    HTTPStatus.BAD_REQUEST,
                    formatZodValidationErrors(parseResult.error),
                    "Validation error"
                );
            }

            const newUser = await userService.createUser(parseResult.data);

            if ('error' in newUser) {
                return answerAPI(res, HTTPStatus.BAD_REQUEST, undefined, newUser.error);
            }

            await createLog(LogType.SUCCESS, LogOperation.CREATION, LogCategory.USER, newUser, newUser.id);
            return answerAPI(res, HTTPStatus.CREATED, newUser);
        } catch (error) {
            await createLog(
                LogType.ERROR,
                LogOperation.CREATION,
                LogCategory.USER,
                formatError(error),
                undefined,
                next
            );
            return answerAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, "Failed to create user");
        }
    }

    /**
     * Fetches all registered users.
     */
    static async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const userService = new UserService();
            const usersFound = await userService.getUsers();

            return answerAPI(res, HTTPStatus.OK, usersFound, usersFound.users.length ? undefined : "No users found");
        } catch (error) {
            await createLog(
                LogType.ERROR,
                LogOperation.SEARCH,
                LogCategory.USER,
                formatError(error),
                undefined,
                next
            );
            return answerAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, "Error retrieving users");
        }
    }

    /**
     * Retrieves a specific user by ID.
     */
    static async getUserById(req: Request, res: Response, next: NextFunction) {
        const userId = Number(req.params.id);

        if (isNaN(userId) || userId <= 0) {
            return answerAPI(res, HTTPStatus.BAD_REQUEST, undefined, "Invalid user ID");
        }

        try {
            const userService = new UserService();
            const user = await userService.getUserById(userId);

            if ('error' in user) {
                return answerAPI(res, HTTPStatus.BAD_REQUEST, undefined, user);
            }

            return answerAPI(res, HTTPStatus.OK, user);
        } catch (error) {
            await createLog(
                LogType.ERROR,
                LogOperation.SEARCH,
                LogCategory.USER,
                formatError(error),
                undefined,
                next
            );
            return answerAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, "Error retrieving user");
        }
    }

    /**
     * Searches for users by email using a partial match (LIKE query).
     */
    static async getUsersByEmail(req: Request, res: Response, next: NextFunction) {
        const searchTerm = req.query.email as string;

        if (!searchTerm || searchTerm.length < 3) {
            return answerAPI(res, HTTPStatus.BAD_REQUEST, undefined, "Search term must contain at least 3 characters");
        }

        try {
            const userService = new UserService();
            const usersFound = await userService.getUsersByEmail(searchTerm);

            return answerAPI(res, HTTPStatus.OK, usersFound, usersFound.users.length ? undefined : "No users found");
        } catch (error) {
            await createLog(
                LogType.ERROR,
                LogOperation.SEARCH,
                LogCategory.USER,
                formatError(error),
                undefined,
                next
            );
            return answerAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, "Error retrieving users");
        }
    }

    /**
     * Updates an existing user by ID.
     */
    static async updateUser(req: Request, res: Response, next: NextFunction) {
        const userId = Number(req.params.id);

        if (isNaN(userId) || userId <= 0) {
            return answerAPI(res, HTTPStatus.BAD_REQUEST, undefined, "User ID must be a positive number");
        }

        try {
            const parseResult = updateUserSchema.safeParse(req.body);

            if (!parseResult.success) {
                return answerAPI(
                    res,
                    HTTPStatus.BAD_REQUEST,
                    formatZodValidationErrors(parseResult.error),
                    "Validation error"
                );
            }

            const userService = new UserService();
            const updatedUser = await userService.updateUser(userId, parseResult.data);

            if ('error' in updatedUser) {
                return answerAPI(res, HTTPStatus.BAD_REQUEST, undefined, updatedUser);
            }

            await createLog(LogType.SUCCESS, LogOperation.UPDATE, LogCategory.USER, updatedUser, updatedUser.id);
            return answerAPI(res, HTTPStatus.OK, updatedUser);
        } catch (error) {
            await createLog(
                LogType.ERROR,
                LogOperation.UPDATE,
                LogCategory.USER,
                formatError(error),
                userId,
                next
            );

            return answerAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, "Error updating user");
        }
    }

    /**
     * Permanently removes a user by ID.
     */
    static async deleteUser(req: Request, res: Response, next: NextFunction) {
        const userId = Number(req.params.id);

        if (isNaN(userId) || userId <= 0) {
            return answerAPI(res, HTTPStatus.BAD_REQUEST, undefined, "Invalid user ID");
        }

        try {
            const userService = new UserService();
            const result = await userService.deleteUser(userId);

            if ('error' in result) {
                return answerAPI(res, HTTPStatus.BAD_REQUEST, undefined, result.error);
            }

            await createLog(LogType.SUCCESS, LogOperation.DELETION, LogCategory.USER, result, userId, next);
            return answerAPI(res, HTTPStatus.OK, { id: userId });
        } catch (error) {
            await createLog(
                LogType.ERROR,
                LogOperation.DELETION,
                LogCategory.USER,
                formatError(error),
                userId,
                next
            );
            return answerAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, "Failed to delete user");
        }
    }
}

export default UserController;
