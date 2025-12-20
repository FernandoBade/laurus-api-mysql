import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../service/authService';
import { answerAPI, formatError, createLog } from '../utils/commons';
import { LogType, LogCategory, LogOperation, HTTPStatus } from '../utils/enum';
import { Resource } from '../utils/resources/resource';
import { RefreshTokenCookie, ClearCookieOptions } from '../utils/auth/cookieConfig';

export class AuthController {
    /**
     * Authenticates a user using email and password credentials.
     * If valid, generates an access token and sets a refresh token as an HTTP-only cookie.
     *
     * @param req - Express request containing email and password.
     * @param res - Express response used to return the access token.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with access token or appropriate error.
     */
    static async login(req: Request, res: Response, next: NextFunction) {
        const email = (req.body?.email ?? '').toString().trim().toLowerCase();
        const password = req.body?.password as string | undefined;

        if (!email || !password) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_CREDENTIALS);
        }

        const authService = new AuthService();

        try {
            const result = await authService.login(email, password);

            if (!result.success || !result.data) {
                return answerAPI(req, res, HTTPStatus.UNAUTHORIZED, undefined, Resource.INVALID_CREDENTIALS);
            }


            res.cookie(RefreshTokenCookie.name, result.data.refreshToken, RefreshTokenCookie.options);

            await createLog(
                LogType.SUCCESS,
                LogOperation.LOGIN,
                LogCategory.AUTH,
                { userId: result.data.user.id },
                result.data.user.id
            );

            return answerAPI(req, res, HTTPStatus.OK, { token: result.data.token });
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.LOGIN, LogCategory.AUTH, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Issues a new access token using a valid refresh token from the cookie.
     * If the token is missing or invalid, responds with HTTP 401 Unauthorized.
     *
     * @param req - Express request containing the refresh token in cookies.
     * @param res - Express response used to return the new access token.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with new access token or appropriate error.
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
     * Logs out the user by removing the refresh token from the database and clearing the cookie.
     * Logs the operation and handles invalid or missing token cases gracefully.
     *
     * @param req - Express request containing the refresh token.
     * @param res - Express response confirming logout.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 on successful logout or appropriate error.
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

            res.clearCookie(RefreshTokenCookie.name, ClearCookieOptions);

            await createLog(
                LogType.SUCCESS,
                LogOperation.LOGOUT,
                LogCategory.AUTH,
                { userId: result.data.userId },
                result.data.userId
            );

            return answerAPI(req, res, HTTPStatus.OK);

        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.LOGOUT, LogCategory.AUTH, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }
}

export default AuthController;
