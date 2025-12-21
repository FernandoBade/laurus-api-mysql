"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../service/authService");
const commons_1 = require("../utils/commons");
const enum_1 = require("../utils/enum");
const resource_1 = require("../utils/resources/resource");
const cookieConfig_1 = require("../utils/auth/cookieConfig");
class AuthController {
    /**
     * Authenticates a user using email and password credentials.
     * If valid, generates an access token and sets a refresh token as an HTTP-only cookie.
     *
     * @param req - Express request containing email and password.
     * @param res - Express response used to return the access token.
     * @param next - Express next function for error handling.
     * @returns HTTP 200 with access token or appropriate error.
     */
    static async login(req, res, next) {
        var _a, _b, _c;
        const email = ((_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.email) !== null && _b !== void 0 ? _b : '').toString().trim().toLowerCase();
        const password = (_c = req.body) === null || _c === void 0 ? void 0 : _c.password;
        if (!email || !password) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_CREDENTIALS);
        }
        const authService = new authService_1.AuthService();
        try {
            const result = await authService.login(email, password);
            if (!result.success || !result.data) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.UNAUTHORIZED, undefined, resource_1.Resource.INVALID_CREDENTIALS);
            }
            res.cookie(cookieConfig_1.RefreshTokenCookie.name, result.data.refreshToken, cookieConfig_1.RefreshTokenCookie.options);
            await (0, commons_1.createLog)(enum_1.LogType.SUCCESS, enum_1.LogOperation.LOGIN, enum_1.LogCategory.AUTH, { userId: result.data.user.id }, result.data.user.id);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK, { token: result.data.token });
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.LOGIN, enum_1.LogCategory.AUTH, (0, commons_1.formatError)(error), undefined, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
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
    static async refresh(req, res, next) {
        var _a;
        const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
        if (!refreshToken) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.UNAUTHORIZED, undefined, resource_1.Resource.EXPIRED_OR_INVALID_TOKEN);
        }
        const authService = new authService_1.AuthService();
        try {
            const result = await authService.refresh(refreshToken);
            if (!result.success || !result.data) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.UNAUTHORIZED, undefined, resource_1.Resource.EXPIRED_OR_INVALID_TOKEN);
            }
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK, result.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.UPDATE, enum_1.LogCategory.AUTH, (0, commons_1.formatError)(error), undefined, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
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
    static async logout(req, res, next) {
        var _a;
        const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
        if (!refreshToken) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.TOKEN_NOT_FOUND);
        }
        const authService = new authService_1.AuthService();
        try {
            const result = await authService.logout(refreshToken);
            if (!result.success || !result.data) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.TOKEN_NOT_FOUND);
            }
            res.clearCookie(cookieConfig_1.RefreshTokenCookie.name, cookieConfig_1.ClearCookieOptions);
            await (0, commons_1.createLog)(enum_1.LogType.SUCCESS, enum_1.LogOperation.LOGOUT, enum_1.LogCategory.AUTH, { userId: result.data.userId }, result.data.userId);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.LOGOUT, enum_1.LogCategory.AUTH, (0, commons_1.formatError)(error), undefined, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
}
exports.AuthController = AuthController;
exports.default = AuthController;
