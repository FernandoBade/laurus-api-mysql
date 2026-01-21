import crypto from 'crypto';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createLog } from '../commons';
import { LogCategory, LogType, LogOperation } from '../../../../shared/enums';
import { PERSISTED_TOKEN_EXPIRES_IN } from './tokenConfig';

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const TOKEN_ISSUER = process.env.JWT_ISSUER;
const TOKEN_AUDIENCE = process.env.JWT_AUDIENCE;
const JWT_ALGORITHM: jwt.Algorithm = 'HS256';

/**
 * Ensures that required JWT secrets are defined.
 * If any secret is missing, logs a DEBUG message and throws an internal error.
 *
 * @summary Validates required JWT secrets.
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

        createLog(LogType.DEBUG, LogOperation.CREATE, LogCategory.AUTH, message);
        throw new Error('TokenUtilsInvariantViolation: jwt secrets missing');
    }
}

/**
 * Builds JWT sign options with optional issuer/audience.
 */
function buildSignOptions(expiresIn: jwt.SignOptions['expiresIn']): jwt.SignOptions {
    const options: jwt.SignOptions = { expiresIn, algorithm: JWT_ALGORITHM };

    if (TOKEN_ISSUER) {
        options.issuer = TOKEN_ISSUER;
    }

    if (TOKEN_AUDIENCE) {
        options.audience = TOKEN_AUDIENCE;
    }

    return options;
}

/**
 * Builds JWT verify options with optional issuer/audience enforcement.
 */
function buildVerifyOptions(): jwt.VerifyOptions {
    const options: jwt.VerifyOptions = { algorithms: [JWT_ALGORITHM] };

    if (TOKEN_ISSUER) {
        options.issuer = TOKEN_ISSUER;
    }

    if (TOKEN_AUDIENCE) {
        options.audience = TOKEN_AUDIENCE;
    }

    return options;
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
        return jwt.sign(payload, ACCESS_SECRET!, buildSignOptions('1h'));
    },

    /**
     * Generates a JWT refresh token with a finite rotation lifetime.
     * Throws if required secrets are missing.
     *
     * @param payload - Data to embed in the token.
     * @returns Signed refresh token.
     */
    generateRefreshToken(payload: object): string {
        ensureSecrets();
        return jwt.sign(payload, REFRESH_SECRET!, buildSignOptions(PERSISTED_TOKEN_EXPIRES_IN));
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
        return jwt.verify(token, ACCESS_SECRET!, buildVerifyOptions());
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
        return jwt.verify(token, REFRESH_SECRET!, buildVerifyOptions());
    },

    /**
     * Hashes a refresh token using HMAC-SHA256.
     *
     * @param token - Refresh token to hash.
     * @returns HMAC-SHA256 hash in hex format.
     */
    hashRefreshToken(token: string): string {
        ensureSecrets();
        return crypto.createHmac('sha256', REFRESH_SECRET!).update(token).digest('hex');
    }
};

