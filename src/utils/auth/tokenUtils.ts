import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createLog } from '../commons';
import { LogCategory, LogType, LogOperation } from '../enum';

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

/**
 * Ensures that required JWT secrets are defined.
 * If any secret is missing, logs a DEBUG message and throws an internal error.
 */
function ensureSecrets() {
    if (!ACCESS_SECRET || !REFRESH_SECRET) {
        const message = `[TokenUtils] JWT secret(s) missing:

        - JWT_ACCESS_SECRET: ${ACCESS_SECRET ? 'DEFINED' : 'MISSING'}
        - JWT_REFRESH_SECRET: ${REFRESH_SECRET ? 'DEFINED' : 'MISSING'}

        These secrets are required to sign and verify JWT tokens.

        Please define them in your .env file. Example:
            JWT_ACCESS_SECRET=your_super_secret_key
            JWT_REFRESH_SECRET=your_other_super_secret_key
        `;

        createLog(LogType.DEBUG, LogOperation.AUTH, LogCategory.AUTH, message);
        throw new Error('TokenUtilsInvariantViolation: jwt secrets missing');
    }
}

export const TokenUtils = {
    /**
     * Generates a JWT access token with 1-hour expiration.
     * Throws if required secrets are missing.
     *
     * @param payload - Data to embed in the token (e.g. user ID).
     * @returns Signed access token.
     */
    generateAccessToken(payload: object): string {
        ensureSecrets();
        return jwt.sign(payload, ACCESS_SECRET!, { expiresIn: '1h' });
    },

    /**
     * Generates a JWT refresh token with 1-year expiration.
     * Throws if required secrets are missing.
     *
     * @param payload - Data to embed in the token.
     * @returns Signed refresh token.
     */
    generateRefreshToken(payload: object): string {
        ensureSecrets();
        return jwt.sign(payload, REFRESH_SECRET!, { expiresIn: '365d' });
    },

    /**
     * Verifies the authenticity of an access token.
     * Throws if invalid or expired.
     *
     * @param token - Access token to verify.
     * @returns Decoded payload.
     */
    verifyAccessToken(token: string) {
        ensureSecrets();
        return jwt.verify(token, ACCESS_SECRET!);
    },

    /**
     * Verifies the authenticity of a refresh token.
     * Throws if invalid or expired.
     *
     * @param token - Refresh token to verify.
     * @returns Decoded payload.
     */
    verifyRefreshToken(token: string) {
        ensureSecrets();
        return jwt.verify(token, REFRESH_SECRET!);
    }
};
