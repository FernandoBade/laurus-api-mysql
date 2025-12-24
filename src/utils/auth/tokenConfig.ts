export const PERSISTED_TOKEN_TTL_DAYS = 30; // Short lifetime with rotation reduces long-lived token risk.
export const PERSISTED_TOKEN_EXPIRES_IN = `${PERSISTED_TOKEN_TTL_DAYS}d` as const;
export const PERSISTED_TOKEN_MAX_AGE_MS = PERSISTED_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

export const buildPersistedTokenExpiresAt = (from: Date = new Date()): Date => {
    const expiresAt = new Date(from);
    expiresAt.setDate(expiresAt.getDate() + PERSISTED_TOKEN_TTL_DAYS);
    return expiresAt;
};
