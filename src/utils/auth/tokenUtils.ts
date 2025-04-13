import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';

export const TokenUtils = {
    /**
     * Generates a JWT access token valid for 1 hour.
     */
    generateAccessToken(payload: object): string {
        return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '1h' });
    },

    /**
     * Generates a JWT refresh token valid for 1 year.
     */
    generateRefreshToken(payload: object): string {
        return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '365d' });
    },

    /**
     * Verifies an access token and returns its decoded payload if valid.
     */
    verifyAccessToken(token: string) {
        return jwt.verify(token, ACCESS_SECRET);
    },

    /**
     * Verifies a refresh token and returns its decoded payload if valid.
     */
    verifyRefreshToken(token: string) {
        return jwt.verify(token, REFRESH_SECRET);
    }
};
