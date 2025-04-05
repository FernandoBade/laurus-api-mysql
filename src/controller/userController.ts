import { Request, Response, NextFunction } from 'express';
import { UserService } from '../service/userService';
import { formatZodValidationErrors, createLog, answerAPI, formatError } from '../utils/commons';
import { LogCategory, HTTPStatus, Operation, LogType } from '../utils/enum';
import { createUserSchema, updateUserSchema } from '../model/user/userSchema';
import { Resource } from '../utils/resources/resource';

class UserController {
    static async createUser(req: Request, res: Response, next: NextFunction) {
        const userService = new UserService();

        try {
            const parseResult = createUserSchema.safeParse(req.body);

            if (!parseResult.success) {
                return answerAPI(
                    req,
                    res,
                    HTTPStatus.BAD_REQUEST,
                    formatZodValidationErrors(parseResult.error),
                    Resource.VALIDATION_ERROR
                );
            }

            const newUser = await userService.createUser(parseResult.data);

            if (!newUser.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, newUser.error ? Resource.EMAIL_IN_USE: newUser.error);
            }

            await createLog(LogType.SUCCESS, Operation.CREATE, LogCategory.USER, newUser.data, newUser.data.id);
            return answerAPI(req, res, HTTPStatus.CREATED, newUser.data);
        } catch (error) {
            await createLog(
                LogType.ERROR,
                Operation.CREATE,
                LogCategory.USER,
                formatError(error),
                undefined,
                next
            );
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    static async getUsers(req: Request, res: Response, next: NextFunction) {
        const userService = new UserService();

        try {
            const usersFound = await userService.getUsers();
            return answerAPI(req, res, HTTPStatus.OK, usersFound.data, usersFound.data?.length ? undefined : Resource.NO_RECORDS_FOUND);
        } catch (error) {
            await createLog(LogType.ERROR, Operation.SEARCH, LogCategory.USER, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    static async getUserById(req: Request, res: Response, next: NextFunction) {
        const userId = Number(req.params.id);
        if (isNaN(userId) || userId <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_USER_ID);
        }

        const userService = new UserService();

        try {
            const user = await userService.getUserById(userId);
            if (!user.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, user.error ? Resource.EMAIL_IN_USE: user.error);
            }

            return answerAPI(req, res, HTTPStatus.OK, user.data);
        } catch (error) {
            await createLog(LogType.ERROR, Operation.SEARCH, LogCategory.USER, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    static async getUsersByEmail(req: Request, res: Response, next: NextFunction) {
        const searchTerm = req.query.email as string;

        if (!searchTerm || searchTerm.length < 3) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.SEARCH_TERM_TOO_SHORT);
        }

        const userService = new UserService();

        try {
            const usersFound = await userService.getUsersByEmail(searchTerm);
            return answerAPI(req, res, HTTPStatus.OK, usersFound.data, usersFound.data?.length ? undefined : Resource.NO_RECORDS_FOUND);
        } catch (error) {
            await createLog(LogType.ERROR, Operation.SEARCH, LogCategory.USER, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    static async updateUser(req: Request, res: Response, next: NextFunction) {
        const userId = Number(req.params.id);
        if (isNaN(userId) || userId <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_USER_ID);
        }

        const userService = new UserService();

        const existingUser = await userService.findOne(userId);

        if (existingUser.error) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, existingUser.error ? Resource.EMAIL_IN_USE : existingUser.error);
        }

        try {
            const parseResult = updateUserSchema.safeParse(req.body);

            if (!parseResult.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, formatZodValidationErrors(parseResult.error), Resource.VALIDATION_ERROR);
            }

            const updatedUser = await userService.updateUser(userId, parseResult.data);
            if (!updatedUser.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, updatedUser.error ? Resource.EMAIL_IN_USE: updatedUser.error);
            }

            await createLog(LogType.SUCCESS, Operation.UPDATE, LogCategory.USER, updatedUser.data, updatedUser.data.id);
            return answerAPI(req, res, HTTPStatus.OK, updatedUser.data);
        } catch (error) {
            await createLog(LogType.ERROR, Operation.UPDATE, LogCategory.USER, formatError(error), userId, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    static async deleteUser(req: Request, res: Response, next: NextFunction) {
        const userId = Number(req.params.id);

        if (isNaN(userId) || userId <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_USER_ID);
        }

        const userService = new UserService();

        try {
            const result = await userService.deleteUser(userId);

            if (!result.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, result.error ? Resource.EMAIL_IN_USE: result.error);
            }

            await createLog(LogType.SUCCESS, Operation.DELETE, LogCategory.USER, result.data, userId);
            return answerAPI(req, res, HTTPStatus.OK, result.data);
        } catch (error) {
            await createLog(LogType.ERROR, Operation.DELETE, LogCategory.USER, formatError(error), userId, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }
}

export default UserController;
