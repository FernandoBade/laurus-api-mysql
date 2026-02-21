import {
    EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS,
    EMAIL_VERIFICATION_TTL_MINUTES,
    PASSWORD_RESET_TTL_MINUTES,
    PERSISTED_TOKEN_EXPIRES_IN,
    PERSISTED_TOKEN_MAX_AGE_MS,
    PERSISTED_TOKEN_TTL_DAYS,
    SESSION_MAX_AGE_MS,
    SESSION_TTL_DAYS,
    buildEmailVerificationExpiresAt,
    buildPasswordResetExpiresAt,
    buildPersistedTokenExpiresAt,
    buildSessionExpiresAt,
} from '../../../src/utils/auth/tokenConfig';

describe('tokenConfig', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    it('exposes aligned ttl constants for persisted token and session limits', () => {
        expect(PERSISTED_TOKEN_EXPIRES_IN).toBe(`${PERSISTED_TOKEN_TTL_DAYS}d`);
        expect(PERSISTED_TOKEN_MAX_AGE_MS).toBe(PERSISTED_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
        expect(SESSION_MAX_AGE_MS).toBe(SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
        expect(EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS).toBe(60);
    });

    it('buildPersistedTokenExpiresAt adds persisted token ttl without mutating origin date', () => {
        const origin = new Date('2024-05-10T10:30:00.000Z');

        const result = buildPersistedTokenExpiresAt(origin);

        expect(result).not.toBe(origin);
        expect(result.toISOString()).toBe('2024-06-09T10:30:00.000Z');
        expect(origin.toISOString()).toBe('2024-05-10T10:30:00.000Z');
    });

    it('buildSessionExpiresAt adds full session hard-cap window', () => {
        const origin = new Date('2024-05-10T10:30:00.000Z');

        const result = buildSessionExpiresAt(origin);

        expect(result.toISOString()).toBe('2024-07-09T10:30:00.000Z');
    });

    it('buildEmailVerificationExpiresAt adds email verification ttl in minutes', () => {
        const origin = new Date('2024-05-10T10:30:00.000Z');

        const result = buildEmailVerificationExpiresAt(origin);

        expect(result.toISOString()).toBe('2024-05-10T10:45:00.000Z');
        expect(EMAIL_VERIFICATION_TTL_MINUTES).toBe(15);
    });

    it('buildPasswordResetExpiresAt adds password reset ttl in minutes', () => {
        const origin = new Date('2024-05-10T10:30:00.000Z');

        const result = buildPasswordResetExpiresAt(origin);

        expect(result.toISOString()).toBe('2024-05-10T10:45:00.000Z');
        expect(PASSWORD_RESET_TTL_MINUTES).toBe(15);
    });

    it('uses current time when origin date is omitted', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

        const persisted = buildPersistedTokenExpiresAt();
        const session = buildSessionExpiresAt();
        const email = buildEmailVerificationExpiresAt();
        const password = buildPasswordResetExpiresAt();

        expect(persisted.toISOString()).toBe('2024-01-31T00:00:00.000Z');
        expect(session.toISOString()).toBe('2024-03-01T00:00:00.000Z');
        expect(email.toISOString()).toBe('2024-01-01T00:15:00.000Z');
        expect(password.toISOString()).toBe('2024-01-01T00:15:00.000Z');
    });
});
