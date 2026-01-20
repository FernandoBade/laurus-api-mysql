import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../service/authService';
import { answerAPI, formatError, createLog } from '../utils/commons';
import { LogType, LogCategory, LogOperation, HTTPStatus } from '../../../shared/enums';
import { ResourceKey as Resource } from '../../../shared/i18n/resource.keys';
import { TokenCookie, ClearCookieOptions } from '../utils/auth/cookieConfig';
import { recordLoginFailure, recordRefreshFailure, resetLoginRateLimit, resetRefreshRateLimit } from '../utils/auth/rateLimiter';
import { isString, isValidEmail, hasMinLength } from '../utils/validation/guards';

export class AuthController {
    /**
     * Authenticates a user using email and password credentials.
     * If valid, generates an access token and sets a token cookie for rotation.
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
                if (!result.success && result.error === Resource.INVALID_CREDENTIALS) {
                    recordLoginFailure(req);
                    return answerAPI(req, res, HTTPStatus.UNAUTHORIZED, undefined, Resource.INVALID_CREDENTIALS);
                }
                if (!result.success && result.error === Resource.EMAIL_NOT_VERIFIED) {
                    return answerAPI(req, res, HTTPStatus.UNAUTHORIZED, {
                        code: Resource.EMAIL_NOT_VERIFIED,
                        email,
                        canResend: true,
                        verificationSent: true
                    }, Resource.EMAIL_NOT_VERIFIED);
                }
                return answerAPI(req, res, HTTPStatus.UNAUTHORIZED, undefined, Resource.INVALID_CREDENTIALS);
            }

            resetLoginRateLimit(req);
            res.cookie(TokenCookie.name, result.data.refreshToken, TokenCookie.options);

            await createLog(
                LogType.SUCCESS,
                LogOperation.LOGIN,
                LogCategory.AUTH,
                {
                    userId: result.data.user.id,
                    ip: req.ip,
                    userAgent: req.headers['user-agent']
                },
                result.data.user.id
            );

            return answerAPI(req, res, HTTPStatus.OK, { token: result.data.token });
        } catch (error) {
            await createLog(
                LogType.ERROR,
                LogOperation.LOGIN,
                LogCategory.AUTH,
                {
                    error: formatError(error),
                    ip: req.ip,
                    userAgent: req.headers['user-agent']
                },
                undefined,
                next
            );
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Issues a new access token and rotates the token cookie.
     * If the token is missing or invalid, responds with HTTP 401 Unauthorized.
     *
     * @param req - Express request containing the token in cookies.
     * @param res - Express response used to return the new access token.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with new access token or appropriate error.
     */
    static async refresh(req: Request, res: Response, next: NextFunction) {
        const token = req.cookies?.refreshToken;

        if (!token) {
            return answerAPI(req, res, HTTPStatus.UNAUTHORIZED, undefined, Resource.EXPIRED_OR_INVALID_TOKEN);
        }

        const authService = new AuthService();

        try {
            const result = await authService.refresh(token);

            if (!result.success || !result.data) {
                if (!result.success && result.error === Resource.EXPIRED_OR_INVALID_TOKEN) {
                    recordRefreshFailure(req);
                }
                return answerAPI(req, res, HTTPStatus.UNAUTHORIZED, undefined, Resource.EXPIRED_OR_INVALID_TOKEN);
            }

            resetRefreshRateLimit(req);
            res.cookie(TokenCookie.name, result.data.refreshToken, TokenCookie.options);

            return answerAPI(req, res, HTTPStatus.OK, { token: result.data.token });
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.UPDATE, LogCategory.AUTH, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Logs out the user by removing the token from the database and clearing the cookie.
     * Logs the operation and handles invalid or missing token cases gracefully.
     *
     * @param req - Express request containing the token.
     * @param res - Express response confirming logout.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 on successful logout or appropriate error.
     */
    static async logout(req: Request, res: Response, next: NextFunction) {
        const token = req.cookies?.refreshToken;

        if (!token) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.TOKEN_NOT_FOUND);
        }

        const authService = new AuthService();

        try {
            const result = await authService.logout(token);

            if (!result.success || !result.data) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.TOKEN_NOT_FOUND);
            }

            res.clearCookie(TokenCookie.name, ClearCookieOptions);

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

    /**
     * Verifies an email using a verification token.
     *
     * @param req - Express request containing the verification token.
     * @param res - Express response indicating verification result.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 on success or appropriate error.
     */
    static async verifyEmail(req: Request, res: Response, next: NextFunction) {
        const token = req.body?.token;

        if (!isString(token)) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.EXPIRED_OR_INVALID_TOKEN);
        }

        const authService = new AuthService();

        try {
            const result = await authService.verifyEmail(token);

            if (!result.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, result.error);
            }

            const message = result.data?.alreadyVerified
                ? Resource.EMAIL_ALREADY_VERIFIED
                : Resource.EMAIL_VERIFICATION_SUCCESS;
            return answerAPI(req, res, HTTPStatus.OK, result.data, message);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.UPDATE, LogCategory.AUTH, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Resends an email verification token.
     *
     * @param req - Express request containing the email address.
     * @param res - Express response confirming request.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 on success or appropriate error.
     */
    static async resendVerificationEmail(req: Request, res: Response, next: NextFunction) {
        const email = req.body?.email;

        if (!isString(email) || !isValidEmail(email)) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.EMAIL_INVALID);
        }

        const authService = new AuthService();

        try {
            const result = await authService.resendEmailVerification(email);

            if (!result.success) {
                if (result.error === Resource.EMAIL_VERIFICATION_COOLDOWN) {
                    return answerAPI(req, res, HTTPStatus.TOO_MANY_REQUESTS, {
                        code: Resource.EMAIL_VERIFICATION_COOLDOWN,
                        cooldownSeconds: result.data?.cooldownSeconds ?? 0
                    }, Resource.EMAIL_VERIFICATION_COOLDOWN);
                }
                return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, result.error);
            }

            return answerAPI(req, res, HTTPStatus.OK, result.data, Resource.EMAIL_VERIFICATION_REQUESTED);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.UPDATE, LogCategory.AUTH, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Requests a password reset token.
     *
     * @param req - Express request containing the email address.
     * @param res - Express response confirming request.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 on success or appropriate error.
     */
    static async forgotPassword(req: Request, res: Response, next: NextFunction) {
        const email = req.body?.email;

        if (!isString(email) || !isValidEmail(email)) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.EMAIL_INVALID);
        }

        const authService = new AuthService();

        try {
            const result = await authService.requestPasswordReset(email);

            if (!result.success) {
                return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, result.error);
            }

            return answerAPI(req, res, HTTPStatus.OK, result.data, Resource.PASSWORD_RESET_REQUESTED);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.UPDATE, LogCategory.AUTH, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Resets a password using a valid reset token.
     *
     * @param req - Express request containing token and new password.
     * @param res - Express response indicating reset status.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 on success or appropriate error.
     */
    static async resetPassword(req: Request, res: Response, next: NextFunction) {
        const token = req.body?.token;
        const password = req.body?.password;

        if (!isString(token)) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.EXPIRED_OR_INVALID_TOKEN);
        }

        if (!isString(password) || !hasMinLength(password, 6)) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.PASSWORD_TOO_SHORT);
        }

        const authService = new AuthService();

        try {
            const result = await authService.resetPassword(token, password);

            if (!result.success) {
                const status = result.error === Resource.INTERNAL_SERVER_ERROR ? HTTPStatus.INTERNAL_SERVER_ERROR : HTTPStatus.BAD_REQUEST;
                return answerAPI(req, res, status, undefined, result.error);
            }

            return answerAPI(req, res, HTTPStatus.OK, result.data, Resource.PASSWORD_RESET_SUCCESS);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.UPDATE, LogCategory.AUTH, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }
}

export default AuthController;
