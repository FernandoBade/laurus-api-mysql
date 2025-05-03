import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createLog } from '../commons';
import { LogCategory, LogType, LogOperation } from '../enum';
import { Resource } from '../resources/resource';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

dotenv.config();

/**
 * Ensures required JWT secrets are defined and throws a descriptive error if not.
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

        throw new Error(Resource.INTERNAL_SERVER_ERROR);

    }
}

export const TokenUtils = {
    /**
     * Generates a JWT access token valid for 1 hour.
     */
    generateAccessToken(payload: object): string {
        ensureSecrets();
        return jwt.sign(payload, ACCESS_SECRET!, { expiresIn: '1h' });
    },

    /**
     * Generates a JWT refresh token valid for 1 year.
     */
    generateRefreshToken(payload: object): string {
        ensureSecrets();
        return jwt.sign(payload, REFRESH_SECRET!, { expiresIn: '365d' });
    },

    /**
     * Verifies an access token and returns its decoded payload if valid.
     */
    verifyAccessToken(token: string) {
        ensureSecrets();
        return jwt.verify(token, ACCESS_SECRET!);
    },

    /**
     * Verifies a refresh token and returns its decoded payload if valid.
     */
    verifyRefreshToken(token: string) {
        ensureSecrets();
        return jwt.verify(token, REFRESH_SECRET!);
    }
};
