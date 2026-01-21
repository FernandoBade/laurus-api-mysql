import { LogCategory, LogOperation, LogType } from '../../../../shared/enums';
import { ResourceKey as Resource } from '../../../../shared/i18n/resource.keys';
import { translateResource } from '../../../../shared/i18n/resource.utils';
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

const loadFeedbackEmail = async (env: Record<string, string | undefined>, mockLog = false) => {
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

    const module = await import('../../../src/utils/email/feedbackEmail');
    return { module, createLog, resendSend };
};

describe('feedbackEmail utils', () => {
    afterEach(() => {
        resetEnv();
        jest.resetModules();
        jest.restoreAllMocks();
    });

    it('sends feedback email via resend', async () => {
        const { module, resendSend } = await loadFeedbackEmail({
            RESEND_API_KEY: 'test-key',
            RESEND_FROM_EMAIL: 'no-reply@example.com',
        });

        const result = await module.sendFeedbackEmail({
            userId: 12,
            userEmail: 'user@example.com',
            title: 'Title',
            message: 'Message',
            language: 'en-US',
            attachments: [
                {
                    filename: 'test.png',
                    content: Buffer.from('data'),
                    contentType: 'image/png',
                },
            ],
        });

        expect(result).toEqual({ success: true });
        expect(resendSend).toHaveBeenCalledTimes(1);
        const payload = resendSend.mock.calls[0][0] as Record<string, unknown>;
        expect(payload).toEqual(expect.objectContaining({
            from: 'no-reply@example.com',
            to: 'fer@bade.digital',
            subject: translateResource(Resource.FEEDBACK_EMAIL_SUBJECT, 'en-US'),
        }));
        expect(payload.attachments).toEqual([
            expect.objectContaining({
                filename: 'test.png',
                content: expect.any(Buffer),
                contentType: 'image/png',
            }),
        ]);

        const html = payload.html as string;
        expect(html).toContain(translateResource(Resource.FEEDBACK_EMAIL_INTRO, 'en-US'));
        expect(html).toContain('Title');
        expect(html).toContain('Message');
    });

    it('logs errors when resend fails', async () => {
        const { module, resendSend, createLog } = await loadFeedbackEmail({
            RESEND_API_KEY: 'test-key',
            RESEND_FROM_EMAIL: 'no-reply@example.com',
        }, true);
        resendSend.mockRejectedValue(new Error('resend failed token=secret'));

        await expect(module.sendFeedbackEmail({
            userId: 7,
            userEmail: 'user@example.com',
            title: 'Title',
            message: 'Message',
        })).resolves.toEqual({ success: false });

        expect(createLog).toHaveBeenCalledWith(
            LogType.ERROR,
            LogOperation.CREATE,
            LogCategory.LOG,
            expect.objectContaining({
                event: 'FEEDBACK_EMAIL_SEND_FAILED',
                provider: 'resend',
                error: expect.objectContaining({ message: expect.stringContaining('token=[REDACTED]') }),
            }),
            7
        );
    });
});

