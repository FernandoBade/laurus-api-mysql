import { Resend } from 'resend';
import { createLog } from '../commons';
import { LogCategory, LogOperation, LogType } from '../../../../shared/enums/log.enums';
import { ResourceKey as Resource } from '../../../../shared/i18n/resource.keys';
import type { LanguageCode } from '../../../../shared/i18n/resourceTypes';
import { translateResource } from '../../../../shared/i18n/resource.utils';

export type FeedbackAttachmentInput = {
    filename: string;
    content: Buffer;
    contentType?: string;
};

type FeedbackEmailPayload = {
    to: string;
    userId: number;
    userEmail: string;
    title: string;
    message: string;
    language?: LanguageCode;
    attachments?: FeedbackAttachmentInput[];
};

export type FeedbackEmailSender = (payload: FeedbackEmailPayload) => Promise<boolean>;

type FeedbackEmailContent = {
    subject: string;
    intro: string;
    titleLabel: string;
    messageLabel: string;
    userIdLabel: string;
    userEmailLabel: string;
};

const FEEDBACK_TO_EMAIL = 'fer@bade.digital';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const buildFeedbackEmailContent = (language?: LanguageCode): FeedbackEmailContent => ({
    subject: translateResource(Resource.FEEDBACK_EMAIL_SUBJECT, language),
    intro: translateResource(Resource.FEEDBACK_EMAIL_INTRO, language),
    titleLabel: translateResource(Resource.FEEDBACK_EMAIL_TITLE_LABEL, language),
    messageLabel: translateResource(Resource.FEEDBACK_EMAIL_MESSAGE_LABEL, language),
    userIdLabel: translateResource(Resource.FEEDBACK_EMAIL_USER_ID_LABEL, language),
    userEmailLabel: translateResource(Resource.FEEDBACK_EMAIL_USER_EMAIL_LABEL, language),
});

const buildFeedbackEmailHtml = (
    content: FeedbackEmailContent,
    payload: FeedbackEmailPayload
): string => `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f5f5f5;">
    <div style="max-width:600px;margin:0 auto;padding:24px;font-family:Arial,sans-serif;color:#111;">
      <div style="background:#ffffff;border-radius:8px;padding:24px;">
        <h1 style="font-size:20px;margin:0 0 12px;">${content.subject}</h1>
        <p style="margin:0 0 16px;line-height:1.5;">${content.intro}</p>
        <p style="margin:0 0 6px;line-height:1.5;color:#555;">
          <strong>${content.userIdLabel}</strong> ${payload.userId}
        </p>
        <p style="margin:0 0 12px;line-height:1.5;color:#555;">
          <strong>${content.userEmailLabel}</strong> ${payload.userEmail}
        </p>
        <p style="margin:0 0 6px;line-height:1.5;color:#555;">
          <strong>${content.titleLabel}</strong> ${payload.title}
        </p>
        <p style="margin:0;line-height:1.5;color:#555;">
          <strong>${content.messageLabel}</strong> ${payload.message}
        </p>
      </div>
    </div>
  </body>
</html>`.trim();

const buildFeedbackEmailText = (
    content: FeedbackEmailContent,
    payload: FeedbackEmailPayload
): string => [
    content.subject,
    '',
    content.intro,
    '',
    `${content.userIdLabel} ${payload.userId}`,
    `${content.userEmailLabel} ${payload.userEmail}`,
    '',
    `${content.titleLabel} ${payload.title}`,
    `${content.messageLabel} ${payload.message}`,
].join('\n');

const redactTokens = (value: string): string => value.replace(/token=([^&\s]+)/gi, 'token=[REDACTED]');

const formatEmailError = (error: unknown): Record<string, unknown> => {
    if (error instanceof Error) {
        return { name: error.name, message: redactTokens(error.message) };
    }

    if (error && typeof error === 'object') {
        const payload = error as Record<string, unknown>;
        const message = typeof payload.message === 'string' ? payload.message : 'Email provider error';
        return {
            message: redactTokens(message),
            code: payload.code ?? payload.statusCode ?? payload.status,
        };
    }

    return { message: redactTokens(String(error)) };
};

const logEmailError = async (error: unknown, userId?: number): Promise<void> => {
    try {
        await createLog(
            LogType.ERROR,
            LogOperation.CREATE,
            LogCategory.LOG,
            {
                event: 'FEEDBACK_EMAIL_SEND_FAILED',
                provider: 'resend',
                error: formatEmailError(error),
            },
            userId
        );
    } catch {
        // Ignore logging errors to avoid surfacing email issues.
    }
};

const logConfigError = async (userId?: number): Promise<void> => {
    await logEmailError(new Error('Resend configuration missing'), userId);
};

const defaultSender: FeedbackEmailSender = async (payload) => {
    if (!resend || !RESEND_FROM_EMAIL) {
        await logConfigError(payload.userId);
        return false;
    }

    const content = buildFeedbackEmailContent(payload.language);
    const html = buildFeedbackEmailHtml(content, payload);
    const text = buildFeedbackEmailText(content, payload);

    try {
        const result = await resend.emails.send({
            from: RESEND_FROM_EMAIL,
            to: payload.to,
            subject: content.subject,
            html,
            text,
            attachments: payload.attachments?.map((attachment) => ({
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType,
            })),
        });

        if (result?.error) {
            await logEmailError(result.error, payload.userId);
            return false;
        }
        return true;
    } catch (error) {
        await logEmailError(error, payload.userId);
        return false;
    }
};

export async function sendFeedbackEmail(
    {
        userId,
        userEmail,
        title,
        message,
        language,
        attachments,
    }: Omit<FeedbackEmailPayload, 'to'>,
    sender: FeedbackEmailSender = defaultSender
): Promise<{ success: true } | { success: false }> {
    const success = await sender({
        to: FEEDBACK_TO_EMAIL,
        userId,
        userEmail,
        title,
        message,
        language,
        attachments,
    });

    return success ? { success: true } : { success: false };
}

