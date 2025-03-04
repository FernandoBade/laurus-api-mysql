import { Request, Response, NextFunction } from 'express';
import { UserService } from '../service/userService';
import { formatValidationErrors, createLog, answerAPI } from '../utils/commons';
import { LogCategory, HTTPStatus, Operation, LogType } from '../utils/enum';
import { createUserSchema, updateUserSchema } from '../utils/validator';

class UserController {
    /**
     * Creates a new user.
     * @param req - Request containing user data.
     * @param res - API response.
     * @param next - Middleware for error handling.
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
                    formatValidationErrors(parseResult.error),
                    "Validation error"
                );
            }

            const newUser = await userService.createUser(parseResult.data);

            if ('error' in newUser) {
                return answerAPI(res, HTTPStatus.BAD_REQUEST, undefined, newUser.error);
            }

            await createLog(LogType.SUCCESS, Operation.CREATION, LogCategory.USER, newUser, newUser.id);
            return answerAPI(res, HTTPStatus.CREATED, newUser);
        } catch (error) {
            await createLog(LogType.ERROR, Operation.CREATION, LogCategory.USER, error, undefined, next);
            return answerAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, "Error creating user");
        }
    }

    /**
     * Retrieves all registered users.
     */
    static async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const userService = new UserService();
            const usersFound = await userService.getUsers();

            return answerAPI(res, HTTPStatus.OK, usersFound, usersFound.users.length ? undefined : "No users found");
        } catch (error) {
            await createLog(LogType.ERROR, Operation.SEARCH, LogCategory.USER, error, undefined, next);
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
            await createLog(LogType.ERROR, Operation.SEARCH, LogCategory.USER, error, userId, next);
            return answerAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, "Error retrieving user");
        }
    }

    /**
     * Searches for users by email (partial match using LIKE).
     */
    static async getUsersByEmail(req: Request, res: Response, next: NextFunction) {
        const searchTerm = req.query.email as string;

        if (!searchTerm || searchTerm.length < 3) {
            return answerAPI(res, HTTPStatus.BAD_REQUEST, undefined, "Search term must be at least 3 characters long");
        }

        try {
            const userService = new UserService();
            const usersFound = await userService.getUsersByEmail(searchTerm);

            return answerAPI(res, HTTPStatus.OK, usersFound, usersFound.users.length ? undefined : "No users found");
        } catch (error) {
            await createLog(LogType.ERROR, Operation.SEARCH, LogCategory.USER, error, undefined, next);
            return answerAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, "Error retrieving users");
        }
    }

    /**
     * Updates user data by ID.
     */
    static async updateUser(req: Request, res: Response, next: NextFunction) {
        const userId = Number(req.params.id);

        if (isNaN(userId) || userId <= 0) {
            return answerAPI(res, HTTPStatus.BAD_REQUEST, undefined, "Invalid user ID");
        }

        try {
            const parseResult = updateUserSchema.safeParse(req.body);

            if (!parseResult.success) {
                return answerAPI(
                    res,
                    HTTPStatus.BAD_REQUEST,
                    formatValidationErrors(parseResult.error),
                    "Validation error"
                );
            }

            const userService = new UserService();
            const updatedUser = await userService.updateUser(userId, parseResult.data);

            if ('error' in updatedUser) {
                return answerAPI(res, HTTPStatus.BAD_REQUEST, undefined, updatedUser);
            }

            await createLog(LogType.SUCCESS, Operation.UPDATE, LogCategory.USER, updatedUser, updatedUser.id);
            return answerAPI(res, HTTPStatus.OK, updatedUser);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : error || "Unknown error";

            await createLog(
                LogType.ERROR,
                Operation.UPDATE,
                LogCategory.USER,
                errorMessage,
                userId,
                next
            );

            return answerAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, "Error updating user");
        }
    }

    /**
     * Deletes a user by ID.
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

            await createLog(LogType.SUCCESS, Operation.DELETION, LogCategory.USER, result, userId, next);
            return answerAPI(res, HTTPStatus.OK, { id: userId });
        } catch (error) {
            await createLog(LogType.ERROR, Operation.DELETION, LogCategory.USER, error, userId, next);
            return answerAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, "Error deleting user");
        }
    }
}

export default UserController;
