"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenUtils = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const commons_1 = require("../commons");
const enum_1 = require("../enum");
const resource_1 = require("../resources/resource");
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
dotenv_1.default.config();
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
        (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.AUTH, enum_1.LogCategory.AUTH, message);
        throw new Error(resource_1.Resource.INTERNAL_SERVER_ERROR);
    }
}
exports.TokenUtils = {
    /**
     * Generates a JWT access token with 1-hour expiration.
     * Throws if required secrets are missing.
     *
     * @param payload - Data to embed in the token (e.g. user ID).
     * @returns Signed access token.
     */
    generateAccessToken(payload) {
        ensureSecrets();
        return jsonwebtoken_1.default.sign(payload, ACCESS_SECRET, { expiresIn: '1h' });
    },
    /**
     * Generates a JWT refresh token with 1-year expiration.
     * Throws if required secrets are missing.
     *
     * @param payload - Data to embed in the token.
     * @returns Signed refresh token.
     */
    generateRefreshToken(payload) {
        ensureSecrets();
        return jsonwebtoken_1.default.sign(payload, REFRESH_SECRET, { expiresIn: '365d' });
    },
    /**
     * Verifies the authenticity of an access token.
     * Throws if invalid or expired.
     *
     * @param token - Access token to verify.
     * @returns Decoded payload.
     */
    verifyAccessToken(token) {
        ensureSecrets();
        return jsonwebtoken_1.default.verify(token, ACCESS_SECRET);
    },
    /**
     * Verifies the authenticity of a refresh token.
     * Throws if invalid or expired.
     *
     * @param token - Refresh token to verify.
     * @returns Decoded payload.
     */
    verifyRefreshToken(token) {
        ensureSecrets();
        return jsonwebtoken_1.default.verify(token, REFRESH_SECRET);
    }
};
