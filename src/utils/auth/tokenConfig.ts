export const PERSISTED_TOKEN_TTL_DAYS = 30; // Short lifetime with rotation reduces long-lived token risk.
export const PERSISTED_TOKEN_EXPIRES_IN = `${PERSISTED_TOKEN_TTL_DAYS}d` as const;
export const PERSISTED_TOKEN_MAX_AGE_MS = PERSISTED_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
export const SESSION_TTL_DAYS = 60; // Hard cap on session lifetime regardless of refresh rotation.
export const SESSION_MAX_AGE_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
export const EMAIL_VERIFICATION_TTL_MINUTES = 15;
export const PASSWORD_RESET_TTL_MINUTES = 15;

export const buildPersistedTokenExpiresAt = (from: Date = new Date()): Date => {
    const expiresAt = new Date(from);
    expiresAt.setDate(expiresAt.getDate() + PERSISTED_TOKEN_TTL_DAYS);
    return expiresAt;
};

export const buildSessionExpiresAt = (from: Date = new Date()): Date => {
    const expiresAt = new Date(from);
    expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);
    return expiresAt;
};

export const buildEmailVerificationExpiresAt = (from: Date = new Date()): Date => {
    const expiresAt = new Date(from);
    expiresAt.setMinutes(expiresAt.getMinutes() + EMAIL_VERIFICATION_TTL_MINUTES);
    return expiresAt;
};

export const buildPasswordResetExpiresAt = (from: Date = new Date()): Date => {
    const expiresAt = new Date(from);
    expiresAt.setMinutes(expiresAt.getMinutes() + PASSWORD_RESET_TTL_MINUTES);
    return expiresAt;
};
