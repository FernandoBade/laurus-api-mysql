import bcrypt from 'bcrypt';
import { DbService } from '../utils/database/services/dbService';
import { DbResponse } from '../utils/database/services/dbResponse';
import { LogCategory, LogType, LogOperation, TableName, Operator } from '../utils/enum';
import { TokenUtils } from '../utils/auth/tokenUtils';
import { Resource } from '../utils/resources/resource';
import User from '../model/user/user';
import { RefreshTokenService } from './refreshTokenService';
import { UserService } from './userService';
import RefreshToken from '../model/refresh_token/refresth_token';
import { createLog } from '../utils/commons';

/**
 * Service responsible for handling authentication logic,
 * including login, token generation, refresh and logout.
 */
export class AuthService {
    private userDb: DbService;
    private tokenDb: DbService;

    constructor() {
        this.userDb = new UserService();
        this.tokenDb = new RefreshTokenService();
    }

    /**
     * Authenticates the user by email and password.
     * If valid, generates access and refresh tokens.
     * @param email - The user's email.
     * @param password - The user's password.
     * @returns The access token and sets refresh token in the cookie.
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

        await this.tokenDb.create({
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
     * Generates a new access token from a valid refresh token.
     * @param token - The refresh token.
     * @returns A new access token if valid.
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
     * Logs out the user by deleting the refresh token from the database.
     * @param token - The refresh token to invalidate.
     * @returns Success status.
     */
    async logout(token: string): Promise<DbResponse<{ userId: number }>> {
        const tokens = await this.tokenDb.findMany({ token });
        const stored = tokens.data?.[0];

        if (!stored) {
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
