import bcrypt from 'bcrypt';
import { DbService } from '../utils/database/services/dbService';
import { DbResponse } from '../utils/database/services/dbResponse';
import { LogCategory, LogType, LogOperation, TableName, Operator } from '../utils/enum';
import { TokenUtils } from '../utils/auth/tokenUtils';
import { Resource } from '../utils/resources/resource';
import User from '../model/user/user';
import { RefreshTokenService } from './refreshTokenService';
import { UserService } from './userService';
import RefreshToken from '../model/refresh_token/refresh_token';

type RefreshTokenRow = RefreshToken & { user_id: number };
import { createLog } from '../utils/commons';

export class AuthService {
    private userDb: DbService;
    private tokenDb: DbService;

    constructor() {
        this.userDb = new UserService();
        this.tokenDb = new RefreshTokenService();
    }

    /**
     * Authenticates a user based on email and password.
     * If valid, generates and returns both access and refresh tokens.
     * The refresh token is persisted in the database with 1-year expiration.
     *
     * @param email - User's email.
     * @param password - User's plain-text password.
     * @returns Access and refresh tokens along with user data, or error if credentials are invalid.
     */
    async login(email: string, password: string): Promise<DbResponse<{ token: string; refreshToken: string, user: User }>> {
        if (!password) {
            return { success: false, error: Resource.INVALID_CREDENTIALS };
        }

        const users = await this.userDb.findWithFilters<User>(
            {
                email: {
                    operator: Operator.EQUAL, value: email.trim().toLowerCase()

                }
            });

        const user = users.data?.[0];
        if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
            return { success: false, error: Resource.INVALID_CREDENTIALS };
        }

        const token = TokenUtils.generateAccessToken({ id: user.id });
        const refreshToken = TokenUtils.generateRefreshToken({ id: user.id });

        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        await this.tokenDb.create<RefreshTokenRow>({
            token: refreshToken,
            user_id: user.id,
            expiresAt
        });

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
     * @param token - Refresh token from cookies.
     * @returns New access token or error if the token is expired or invalid.
     */
    async refresh(token: string): Promise<DbResponse<{ token: string }>> {
        const existing = await this.tokenDb.findWithFilters<RefreshToken>(
            {
                token: { operator: Operator.EQUAL, value: token }
            });

        const storedToken = existing.data?.[0];
        if (!storedToken || new Date(storedToken.expiresAt) < new Date()) {
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
     * @param token - Refresh token to invalidate.
     * @returns Success status and user ID if logout succeeds, or error if token is not found.
     */
    async logout(token: string): Promise<DbResponse<{ userId: number }>> {
        const tokens = await this.tokenDb.findMany<RefreshTokenRow>({ token });
        const stored = tokens.data?.[0];

        if (!stored) {
            await createLog(
                LogType.ALERT,
                LogOperation.LOGOUT,
                LogCategory.AUTH,
                `Logout attempt with invalid token: ${token}`
            );
            return { success: false, error: Resource.TOKEN_NOT_FOUND };
        }

        await this.tokenDb.remove(stored.id);
        createLog(
            LogType.SUCCESS,
            LogOperation.LOGOUT,
            LogCategory.AUTH,
            `Refresh token ${stored.id} deleted.`,
            stored.user_id
        )
        return { success: true, data: { userId: stored.user_id } }

    }
}
