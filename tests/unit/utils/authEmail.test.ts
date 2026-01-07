import { LogCategory, LogOperation, LogType } from '../../../src/utils/enum';
import { Resource } from '../../../src/utils/resources/resource';
import { ResourceBase } from '../../../src/utils/resources/languages/resourceService';

const originalEnv = { ...process.env };

const setEnv = (overrides: Record<string, string | undefined>) => {
    Object.keys(overrides).forEach((key) => {
        const value = overrides[key];
        if (value === undefined) {
            delete process.env[key];
        } else {
            process.env[key] = value;
        }
    });
};

const resetEnv = () => {
    Object.keys(process.env).forEach((key) => {
        if (!(key in originalEnv)) {
            delete process.env[key];
        }
    });
    Object.keys(originalEnv).forEach((key) => {
        const value = originalEnv[key];
        if (value === undefined) {
            delete process.env[key];
        } else {
            process.env[key] = value;
        }
    });
};

const loadAuthEmail = async (env: Record<string, string | undefined>, mockLog = false) => {
    jest.resetModules();
    setEnv(env);

    const resendSend = jest.fn().mockResolvedValue({ data: { id: 'email-id' } });
    const ResendMock = jest.fn().mockImplementation(() => ({
        emails: { send: resendSend },
    }));
    jest.doMock('resend', () => ({ Resend: ResendMock }));

    let createLog: jest.Mock | undefined;
    if (mockLog) {
        createLog = jest.fn().mockResolvedValue(undefined);
        jest.doMock('../../../src/utils/commons', () => ({ createLog }));
    } else {
        jest.dontMock('../../../src/utils/commons');
    }

    const module = await import('../../../src/utils/email/authEmail');
    return { module, createLog, resendSend };
};

describe('authEmail utils', () => {
    afterEach(() => {
        resetEnv();
        jest.resetModules();
        jest.restoreAllMocks();
    });

    it('builds verification link with base url and encodes token', async () => {
        const { module } = await loadAuthEmail({
            FRONTEND_BASE_URL: 'https://app.example.com/',
        });

        const link = module.buildEmailVerificationLink('token value?');

        expect(link).toBe('https://app.example.com/verify-email?token=token%20value%3F');
    });

    it('builds reset link with app url when frontend base url is missing', async () => {
        const { module } = await loadAuthEmail({
            FRONTEND_BASE_URL: undefined,
            APP_URL: 'https://app.example.com',
        });

        const link = module.buildPasswordResetLink('reset-token');

        expect(link).toBe('https://app.example.com/reset-password?token=reset-token');
    });

    it('builds relative link when no base url is defined', async () => {
        const { module } = await loadAuthEmail({
            FRONTEND_BASE_URL: undefined,
            APP_URL: undefined,
        });

        const link = module.buildEmailVerificationLink('abc');

        expect(link).toBe('/verify-email?token=abc');
    });

    it('sends verification email payload through custom sender', async () => {
        const { module } = await loadAuthEmail({
            FRONTEND_BASE_URL: 'https://app.example.com',
        });
        const sender = jest.fn().mockResolvedValue(undefined);

        await module.sendEmailVerificationEmail('user@example.com', 'verify-token', 12, sender);

        expect(sender).toHaveBeenCalledWith({
            type: 'email_verification',
            to: 'user@example.com',
            link: 'https://app.example.com/verify-email?token=verify-token',
            userId: 12,
        });
    });

    it('sends reset email payload through custom sender', async () => {
        const { module } = await loadAuthEmail({
            FRONTEND_BASE_URL: 'https://app.example.com',
        });
        const sender = jest.fn().mockResolvedValue(undefined);

        await module.sendPasswordResetEmail('user@example.com', 'reset-token', 7, sender);

        expect(sender).toHaveBeenCalledWith({
            type: 'password_reset',
            to: 'user@example.com',
            link: 'https://app.example.com/reset-password?token=reset-token',
            userId: 7,
        });
    });

    it('sends verification email via resend', async () => {
        const { module, resendSend } = await loadAuthEmail({
            FRONTEND_BASE_URL: 'https://app.example.com',
            RESEND_API_KEY: 'test-key',
            RESEND_FROM_EMAIL: 'no-reply@example.com',
        });

        await module.sendEmailVerificationEmail('user@example.com', 'verify-token', 12);

        expect(resendSend).toHaveBeenCalledTimes(1);
        const payload = resendSend.mock.calls[0][0] as Record<string, unknown>;
        expect(payload).toEqual(expect.objectContaining({
            from: 'no-reply@example.com',
            to: 'user@example.com',
            subject: ResourceBase.translate(Resource.EMAIL_VERIFICATION_SUBJECT),
        }));

        const html = payload.html as string;
        expect(html).toContain(ResourceBase.translate(Resource.EMAIL_VERIFICATION_BODY));
        expect(html).toContain(ResourceBase.translate(Resource.EMAIL_LINK_LABEL));
        expect(html).toContain('https://app.example.com/verify-email?token=verify-token');

        const text = payload.text as string;
        expect(text).toContain(ResourceBase.translate(Resource.EMAIL_VERIFICATION_BODY));
        expect(text).toContain(ResourceBase.translate(Resource.EMAIL_LINK_LABEL));
        expect(text).toContain('https://app.example.com/verify-email?token=verify-token');
    });

    it('sends password reset email via resend', async () => {
        const { module, resendSend } = await loadAuthEmail({
            FRONTEND_BASE_URL: 'https://app.example.com',
            RESEND_API_KEY: 'test-key',
            RESEND_FROM_EMAIL: 'no-reply@example.com',
        });

        await module.sendPasswordResetEmail('user@example.com', 'reset-token', 7);

        expect(resendSend).toHaveBeenCalledTimes(1);
        const payload = resendSend.mock.calls[0][0] as Record<string, unknown>;
        expect(payload).toEqual(expect.objectContaining({
            from: 'no-reply@example.com',
            to: 'user@example.com',
            subject: ResourceBase.translate(Resource.PASSWORD_RESET_SUBJECT),
        }));

        const html = payload.html as string;
        expect(html).toContain(ResourceBase.translate(Resource.PASSWORD_RESET_BODY));
        expect(html).toContain(ResourceBase.translate(Resource.PASSWORD_RESET_WARNING));
        expect(html).toContain('https://app.example.com/reset-password?token=reset-token');
    });

    it('logs resend errors without throwing', async () => {
        const { module, resendSend, createLog } = await loadAuthEmail({
            FRONTEND_BASE_URL: 'https://app.example.com',
            RESEND_API_KEY: 'test-key',
            RESEND_FROM_EMAIL: 'no-reply@example.com',
        }, true);
        resendSend.mockRejectedValue(new Error('resend failed token=secret'));

        await expect(module.sendPasswordResetEmail('user@example.com', 'reset-token', 7)).resolves.toBeUndefined();

        expect(createLog).toHaveBeenCalledWith(
            LogType.ERROR,
            LogOperation.CREATE,
            LogCategory.AUTH,
            expect.objectContaining({
                event: 'AUTH_EMAIL_SEND_FAILED',
                provider: 'resend',
                type: 'password_reset',
                error: expect.objectContaining({ message: expect.stringContaining('token=[REDACTED]') }),
            }),
            7
        );

        const detail = (createLog as jest.Mock).mock.calls[0][3] as Record<string, unknown>;
        expect(JSON.stringify(detail)).not.toContain('reset-token');
        expect(JSON.stringify(detail)).not.toContain('user@example.com');
    });
});
