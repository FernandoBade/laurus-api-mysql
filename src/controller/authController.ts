import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../service/authService';
import { answerAPI, formatError, createLog } from '../utils/commons';
import { LogType, LogCategory, LogOperation, HTTPStatus } from '../utils/enum';
import { Resource } from '../utils/resources/resource';

/**
 * Controller for authentication endpoints:
 * login, refresh and logout.
 */
export class AuthController {
    /**
     * Authenticates a user and sets refresh token as cookie.
     */
    static async login(req: Request, res: Response, next: NextFunction) {
        const { email, password } = req.body;

        if (!email || !password) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_CREDENTIALS);
        }

        const authService = new AuthService();

        try {
            const result = await authService.login(email, password);

            if (!result.success || !result.data) {
                return answerAPI(req, res, HTTPStatus.UNAUTHORIZED, undefined, Resource.INVALID_CREDENTIALS);
            }

            res.cookie('refreshToken', result.data.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365  // 1 year (1000 milliseconds * 60 seconds * 60 minutes * 24 hours * 365 days)
            });

            await createLog(LogType.DEBUG, LogOperation.LOGIN, LogCategory.AUTH, `User ${result.data.user.id} logged in`, result.data.user.id);

            return answerAPI(req, res, HTTPStatus.OK, { token: result.data.token });
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.LOGIN, LogCategory.AUTH, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Issues a new access token from a valid refresh token.
     */
    static async refresh(req: Request, res: Response, next: NextFunction) {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return answerAPI(req, res, HTTPStatus.UNAUTHORIZED, undefined, Resource.EXPIRED_OR_INVALID_TOKEN);
        }

        const authService = new AuthService();

        try {
            const result = await authService.refresh(refreshToken);

            if (!result.success || !result.data) {
                return answerAPI(req, res, HTTPStatus.UNAUTHORIZED, undefined, Resource.EXPIRED_OR_INVALID_TOKEN);
            }

            return answerAPI(req, res, HTTPStatus.OK, result.data);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.UPDATE, LogCategory.AUTH, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Logs out the user and deletes refresh token from DB and cookie.
     */
    static async logout(req: Request, res: Response, next: NextFunction) {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.TOKEN_NOT_FOUND);
        }

        const authService = new AuthService();

        try {
            const result = await authService.logout(refreshToken);

            if (!result.success || !result.data) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.TOKEN_NOT_FOUND);
            }

            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });

            await createLog(
                LogType.DEBUG,
                LogOperation.LOGOUT,
                LogCategory.AUTH,
                `User ${result.data.userId} logged out`
            );

            return answerAPI(req, res, HTTPStatus.OK);

        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.LOGOUT, LogCategory.AUTH, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, formatError(error), Resource.INTERNAL_SERVER_ERROR);
        }
    }
}
