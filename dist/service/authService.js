"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const enum_1 = require("../utils/enum");
const tokenUtils_1 = require("../utils/auth/tokenUtils");
const resource_1 = require("../utils/resources/resource");
const refreshTokenService_1 = require("./refreshTokenService");
const userService_1 = require("./userService");
const commons_1 = require("../utils/commons");
/**
 * Service for authentication operations.
 * Handles user login, token refresh, and logout functionality.
 */
class AuthService {
    constructor() {
        this.userService = new userService_1.UserService();
        this.refreshTokenService = new refreshTokenService_1.RefreshTokenService();
    }
    /**
     * Authenticates a user based on email and password.
     * If valid, generates and returns both access and refresh tokens.
     * The refresh token is persisted in the database with 1-year expiration.
     *
     * @summary Authenticates user and generates tokens.
     * @param email - User's email.
     * @param password - User's plain-text password.
     * @returns Access and refresh tokens along with user data, or error if credentials are invalid.
     */
    async login(email, password) {
        if (!password) {
            return { success: false, error: resource_1.Resource.INVALID_CREDENTIALS };
        }
        // Find user by email
        const usersResult = await this.userService.getUsersByEmail(email.trim().toLowerCase());
        if (!usersResult.success || !usersResult.data || usersResult.data.length === 0) {
            return { success: false, error: resource_1.Resource.INVALID_CREDENTIALS };
        }
        // Get full user with password for comparison
        const userWithPassword = await this.userService.findOne(usersResult.data[0].id);
        if (!userWithPassword.success || !userWithPassword.data) {
            return { success: false, error: resource_1.Resource.INVALID_CREDENTIALS };
        }
        const user = userWithPassword.data;
        if (!user.password || !(await bcrypt_1.default.compare(password, user.password))) {
            return { success: false, error: resource_1.Resource.INVALID_CREDENTIALS };
        }
        const token = tokenUtils_1.TokenUtils.generateAccessToken({ id: user.id });
        const refreshToken = tokenUtils_1.TokenUtils.generateRefreshToken({ id: user.id });
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        const tokenResult = await this.refreshTokenService.createRefreshToken({
            token: refreshToken,
            userId: user.id,
            expiresAt
        });
        if (!tokenResult.success) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
        return {
            success: true,
            data: {
                token,
                refreshToken,
                user
            }
        };
    }
    /**
     * Validates a refresh token and issues a new access token if valid.
     * Checks for token existence, expiration, and signature validity.
     *
     * @summary Refreshes access token using refresh token.
     * @param token - Refresh token from cookies.
     * @returns New access token or error if the token is expired or invalid.
     */
    async refresh(token) {
        const tokenResult = await this.refreshTokenService.findByToken(token);
        if (!tokenResult.success || !tokenResult.data) {
            return { success: false, error: resource_1.Resource.EXPIRED_OR_INVALID_TOKEN };
        }
        const storedToken = tokenResult.data;
        if (new Date(storedToken.expiresAt) < new Date()) {
            return { success: false, error: resource_1.Resource.EXPIRED_OR_INVALID_TOKEN };
        }
        try {
            const payload = tokenUtils_1.TokenUtils.verifyRefreshToken(token);
            const newToken = tokenUtils_1.TokenUtils.generateAccessToken({ id: payload.id });
            return { success: true, data: { token: newToken } };
        }
        catch (_a) {
            return { success: false, error: resource_1.Resource.EXPIRED_OR_INVALID_TOKEN };
        }
    }
    /**
     * Logs out the user by removing the refresh token from the database.
     * Logs the operation if the token is valid. Fails silently if token is not found.
     *
     * @summary Invalidates refresh token on logout.
     * @param token - Refresh token to invalidate.
     * @returns Success status and user ID if logout succeeds, or error if token is not found.
     */
    async logout(token) {
        const tokenResult = await this.refreshTokenService.findByToken(token);
        if (!tokenResult.success || !tokenResult.data) {
            await (0, commons_1.createLog)(enum_1.LogType.ALERT, enum_1.LogOperation.LOGOUT, enum_1.LogCategory.AUTH, `Logout attempt with invalid token: ${token}`);
            return { success: false, error: resource_1.Resource.TOKEN_NOT_FOUND };
        }
        const stored = tokenResult.data;
        await this.refreshTokenService.deleteRefreshToken(stored.id);
        await (0, commons_1.createLog)(enum_1.LogType.SUCCESS, enum_1.LogOperation.LOGOUT, enum_1.LogCategory.AUTH, `Refresh token ${stored.id} deleted.`, stored.userId || undefined);
        return { success: true, data: { userId: stored.userId || 0 } };
    }
}
exports.AuthService = AuthService;
