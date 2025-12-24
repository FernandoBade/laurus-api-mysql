import bcrypt from 'bcrypt';
import { LogCategory, LogType, LogOperation, TokenType } from '../utils/enum';
import { TokenUtils } from '../utils/auth/tokenUtils';
import { Resource } from '../utils/resources/resource';
import { TokenService } from './tokenService';
import { UserService } from './userService';
import { SelectUser } from '../db/schema';
import { createLog } from '../utils/commons';
import { buildPersistedTokenExpiresAt } from '../utils/auth/tokenConfig';

/**
 * Service for authentication operations.
 * Handles user login, token refresh, and logout functionality.
 */
export class AuthService {
    private userService: UserService;
    private tokenService: TokenService;

    constructor() {
        this.userService = new UserService();
        this.tokenService = new TokenService();
    }

    /**
     * Authenticates a user based on email and password.
     * If valid, generates and returns an access token and a rotation token.
     * The token hash is persisted in the database with a finite lifetime.
     *
     * @summary Authenticates user and generates tokens.
     * @param email - User's email.
     * @param password - User's plain-text password.
     * @returns Access token and rotation token along with user data, or error if credentials are invalid.
     */
    async login(email: string, password: string): Promise<{ success: true; data: { token: string; refreshToken: string; user: SelectUser } } | { success: false; error: Resource }> {
        if (!password) {
            return { success: false, error: Resource.INVALID_CREDENTIALS };
        }

        // Find user by email
        const usersResult = await this.userService.getUserByEmailExact(email.trim().toLowerCase());
        if (!usersResult.success || !usersResult.data || usersResult.data.length === 0) {
            return { success: false, error: Resource.INVALID_CREDENTIALS };
        }

        // Get full user with password for comparison
        const userWithPassword = await this.userService.findOne(usersResult.data[0].id);
        if (!userWithPassword.success || !userWithPassword.data) {
            return { success: false, error: Resource.INVALID_CREDENTIALS };
        }

        const user = userWithPassword.data;
        if (!user.active) {
            return { success: false, error: Resource.INVALID_CREDENTIALS };
        }
        if (!user.password || !(await bcrypt.compare(password, user.password))) {
            return { success: false, error: Resource.INVALID_CREDENTIALS };
        }

        const token = TokenUtils.generateAccessToken({ id: user.id });
        const tokenValue = TokenUtils.generateRefreshToken({ id: user.id });
        const tokenHash = TokenUtils.hashRefreshToken(tokenValue);

        const expiresAt = buildPersistedTokenExpiresAt();

        const tokenResult = await this.tokenService.createToken({
            tokenHash,
            userId: user.id,
            type: TokenType.REFRESH,
            expiresAt
        });

        if (!tokenResult.success) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }

        await this.tokenService.deleteExpiredTokens();

        return {
            success: true,
            data: {
                token,
                refreshToken: tokenValue,
                user
            }
        };
    }

    /**
     * Validates a refresh token and issues a new access token if valid.
     * Checks for token existence, expiration, and signature validity.
     * Rotates the token on success.
     *
     * @summary Refreshes access token using refresh token.
     * @param token - Token from cookies.
     * @returns New access and refresh tokens or error if the token is expired or invalid.
     */
    async refresh(token: string): Promise<{ success: true; data: { token: string; refreshToken: string } } | { success: false; error: Resource }> {
        const tokenHash = TokenUtils.hashRefreshToken(token);
        const tokenResult = await this.tokenService.findByTokenHash(tokenHash);
        if (!tokenResult.success || !tokenResult.data) {
            return { success: false, error: Resource.EXPIRED_OR_INVALID_TOKEN };
        }

        const storedToken = tokenResult.data;
        const discardStoredToken = () => this.tokenService.deleteToken(storedToken.id).catch(() => undefined);
        if (new Date(storedToken.expiresAt) < new Date()) {
            await discardStoredToken();
            return { success: false, error: Resource.EXPIRED_OR_INVALID_TOKEN };
        }

        let payload: { id: number };
        try {
            payload = TokenUtils.verifyRefreshToken(token) as { id: number };
        } catch {
            await discardStoredToken();
            return { success: false, error: Resource.EXPIRED_OR_INVALID_TOKEN };
        }

        const userResult = await this.userService.findOne(payload.id);
        if (!userResult.success || !userResult.data || !userResult.data.active) {
            await discardStoredToken();
            return { success: false, error: Resource.EXPIRED_OR_INVALID_TOKEN };
        }

        const newToken = TokenUtils.generateAccessToken({ id: payload.id });
        const newTokenValue = TokenUtils.generateRefreshToken({ id: payload.id });
        const newTokenHash = TokenUtils.hashRefreshToken(newTokenValue);
        const newExpiresAt = buildPersistedTokenExpiresAt();

        const createResult = await this.tokenService.createToken({
            tokenHash: newTokenHash,
            userId: payload.id,
            type: TokenType.REFRESH,
            expiresAt: newExpiresAt
        });

        if (!createResult.success) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }

        try {
            const deleted = await this.tokenService.deleteToken(storedToken.id);
            if (deleted === 0) {
                await this.tokenService.deleteByTokenHash(newTokenHash);
                return { success: false, error: Resource.EXPIRED_OR_INVALID_TOKEN };
            }
        } catch (error) {
            await this.tokenService.deleteByTokenHash(newTokenHash);
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }

        await this.tokenService.deleteExpiredTokens();

        return { success: true, data: { token: newToken, refreshToken: newTokenValue } };
    }

    /**
     * Logs out the user by removing the token from the database.
     * Logs the operation if the token is valid. Fails silently if token is not found.
     *
     * @summary Invalidates token on logout.
     * @param token - Token to invalidate.
     * @returns Success status and user ID if logout succeeds, or error if token is not found.
     */
    async logout(token: string): Promise<{ success: true; data: { userId: number } } | { success: false; error: Resource }> {
        const tokenHash = TokenUtils.hashRefreshToken(token);
        const tokenResult = await this.tokenService.findByTokenHash(tokenHash);
        if (!tokenResult.success || !tokenResult.data) {
            await createLog(
                LogType.ALERT,
                LogOperation.LOGOUT,
                LogCategory.AUTH,
                `Logout attempt with invalid token hash: ${tokenHash}`
            );
            return { success: false, error: Resource.TOKEN_NOT_FOUND };
        }

        const stored = tokenResult.data;
        await this.tokenService.deleteToken(stored.id);

        await createLog(
            LogType.SUCCESS,
            LogOperation.LOGOUT,
            LogCategory.AUTH,
            `Token ${stored.id} deleted.`,
            stored.userId || undefined
        );

        return { success: true, data: { userId: stored.userId || 0 } };
    }
}
