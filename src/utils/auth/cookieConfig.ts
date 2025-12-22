/**
 * Base configuration for cookies used in authentication.
 * Ensures security settings based on environment and usage restrictions.
 */
const CookieOptions = {
    httpOnly: true, // Prevents JavaScript access to the cookie (protects from XSS)
    secure: process.env.NODE_ENV === 'production', // Only sends cookie over HTTPS in production
    sameSite: 'strict' as const // Prevents cookie from being sent in cross-site requests
};

/**
 * Configuration for the refresh token cookie.
 * Sets the name and extended expiration (1 year).
 * This cookie is sent only via HTTP and is inaccessible to client-side scripts.
 */
export const RefreshTokenCookie = {
    name: 'refreshToken',
    options: {
        ...CookieOptions,
        maxAge: 1000 * 60 * 60 * 24 * 365 // 1000 milliseconds * 60 seconds * 60 minutes * 24 hours * 365 days = 1 year
    }
};

/**
 * Configuration used when clearing cookies (e.g., during logout).
 * Matches the same security settings used when the cookie was set.
 */
export const ClearCookieOptions = {
    ...CookieOptions
};
