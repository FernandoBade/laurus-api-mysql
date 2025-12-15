import bcrypt from 'bcrypt';
import { LogCategory, LogType, LogOperation, Operator } from '../utils/enum';
import { TokenUtils } from '../utils/auth/tokenUtils';
import { Resource } from '../utils/resources/resource';
import { RefreshTokenService } from './refreshTokenService';
import { UserService } from './userService';
import { SelectUser, SelectRefreshToken } from '../db/schema';
import { createLog } from '../utils/commons';

/**
 * Service for authentication operations.
 * Handles user login, token refresh, and logout functionality.
 */
export class AuthService {
    private userService: UserService;
    private refreshTokenService: RefreshTokenService;

    constructor() {
        this.userService = new UserService();
        this.refreshTokenService = new RefreshTokenService();
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
    async login(email: string, password: string): Promise<{ success: true; data: { token: string; refreshToken: string; user: SelectUser } } | { success: false; error: Resource }> {
        if (!password) {
            return { success: false, error: Resource.INVALID_CREDENTIALS };
        }

        // Find user by email
        const usersResult = await this.userService.getUsersByEmail(email.trim().toLowerCase());
        if (!usersResult.success || !usersResult.data || usersResult.data.length === 0) {
            return { success: false, error: Resource.INVALID_CREDENTIALS };
        }

        // Get full user with password for comparison
        const userWithPassword = await this.userService.findOne(usersResult.data[0].id);
        if (!userWithPassword.success || !userWithPassword.data) {
            return { success: false, error: Resource.INVALID_CREDENTIALS };
        }

        const user = userWithPassword.data;
        if (!user.password || !(await bcrypt.compare(password, user.password))) {
            return { success: false, error: Resource.INVALID_CREDENTIALS };
        }

        const token = TokenUtils.generateAccessToken({ id: user.id });
        const refreshToken = TokenUtils.generateRefreshToken({ id: user.id });

        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        const tokenResult = await this.refreshTokenService.createRefreshToken({
            token: refreshToken,
            userId: user.id,
            expiresAt
        });

        if (!tokenResult.success) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
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
    async refresh(token: string): Promise<{ success: true; data: { token: string } } | { success: false; error: Resource }> {
        const tokenResult = await this.refreshTokenService.findByToken(token);
        if (!tokenResult.success || !tokenResult.data) {
            return { success: false, error: Resource.EXPIRED_OR_INVALID_TOKEN };
        }

        const storedToken = tokenResult.data;
        if (new Date(storedToken.expiresAt) < new Date()) {
            return { success: false, error: Resource.EXPIRED_OR_INVALID_TOKEN };
        }

        try {
            const payload = TokenUtils.verifyRefreshToken(token) as { id: number };
            const newToken = TokenUtils.generateAccessToken({ id: payload.id });

            return { success: true, data: { token: newToken } };
        } catch {
            return { success: false, error: Resource.EXPIRED_OR_INVALID_TOKEN };
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
    async logout(token: string): Promise<{ success: true; data: { userId: number } } | { success: false; error: Resource }> {
        const tokenResult = await this.refreshTokenService.findByToken(token);
        if (!tokenResult.success || !tokenResult.data) {
            await createLog(
                LogType.ALERT,
                LogOperation.LOGOUT,
                LogCategory.AUTH,
                `Logout attempt with invalid token: ${token}`
            );
            return { success: false, error: Resource.TOKEN_NOT_FOUND };
        }

        const stored = tokenResult.data;
        await this.refreshTokenService.deleteRefreshToken(stored.id);

        await createLog(
            LogType.SUCCESS,
            LogOperation.LOGOUT,
            LogCategory.AUTH,
            `Refresh token ${stored.id} deleted.`,
            stored.userId || undefined
        );

        return { success: true, data: { userId: stored.userId || 0 } };
    }
}
