import { Resend } from 'resend';
import { createLog } from '../commons';
import { LogCategory, LogOperation, LogType } from '../enum';
import { ResourceBase } from '../resources/languages/resourceService';
import { Resource } from '../resources/resource';
import { LanguageCode } from '../resources/resourceTypes';

type AuthEmailType = 'email_verification' | 'password_reset';

type AuthEmailPayload = {
    type: AuthEmailType;
    to: string;
    link: string;
    userId?: number;
    language?: LanguageCode;
};

export type AuthEmailSender = (payload: AuthEmailPayload) => Promise<void>;

type AuthEmailContent = {
    subject: string;
    intro: string;
    action: string;
    warning?: string;
    linkLabel: string;
};

const BASE_URL = (process.env.FRONTEND_BASE_URL ?? process.env.APP_URL ?? '').replace(/\/$/, '');
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const buildAuthLink = (path: string, token: string): string => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const encodedToken = encodeURIComponent(token);
    const link = `${normalizedPath}?token=${encodedToken}`;
    return BASE_URL ? `${BASE_URL}${link}` : link;
};

const buildAuthEmailContent = (type: AuthEmailType, language?: LanguageCode): AuthEmailContent => {
    if (type === 'email_verification') {
        return {
            subject: ResourceBase.translate(Resource.EMAIL_VERIFICATION_SUBJECT, language),
            intro: ResourceBase.translate(Resource.EMAIL_VERIFICATION_INTRO, language),
            action: ResourceBase.translate(Resource.EMAIL_VERIFICATION_BUTTON, language),
            linkLabel: ResourceBase.translate(Resource.EMAIL_FALLBACK_LINK_LABEL, language),
        };
    }

    return {
        subject: ResourceBase.translate(Resource.PASSWORD_RESET_SUBJECT, language),
        intro: ResourceBase.translate(Resource.PASSWORD_RESET_INTRO, language),
        action: ResourceBase.translate(Resource.PASSWORD_RESET_BUTTON, language),
        warning: ResourceBase.translate(Resource.PASSWORD_RESET_WARNING, language),
        linkLabel: ResourceBase.translate(Resource.EMAIL_FALLBACK_LINK_LABEL, language),
    };
};

const buildAuthEmailHtml = (content: AuthEmailContent, link: string): string => {
    const warningBlock = content.warning
        ? `<p style="margin:0 0 16px;line-height:1.5;color:#555;">${content.warning}</p>`
        : '';

    return `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f5f5f5;">
    <div style="max-width:600px;margin:0 auto;padding:24px;font-family:Arial,sans-serif;color:#111;">
      <div style="background:#ffffff;border-radius:8px;padding:24px;">
        <h1 style="font-size:20px;margin:0 0 16px;">${content.subject}</h1>
        <p style="margin:0 0 16px;line-height:1.5;">${content.intro}</p>
        <p style="margin:0 0 24px;">
          <a href="${link}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:600;">${content.action}</a>
        </p>
        ${warningBlock}
        <p style="margin:0 0 8px;line-height:1.5;color:#555;">${content.linkLabel}</p>
        <p style="margin:0;word-break:break-word;">
          <a href="${link}" style="color:#111;">${link}</a>
        </p>
      </div>
    </div>
  </body>
</html>`.trim();
};

const buildAuthEmailText = (content: AuthEmailContent, link: string): string => {
    const lines = [
        content.subject,
        '',
        content.intro,
        '',
        content.action,
        link,
        '',
        content.linkLabel,
        link,
    ];

    if (content.warning) {
        lines.push('', content.warning);
    }

    return lines.join('\n');
};

const FALLBACK_EMAIL_ERROR = 'Email provider error';

const redactTokens = (value: string): string => value.replace(/token=([^&\s]+)/gi, 'token=[REDACTED]');

const sanitizeEmailErrorMessage = (message: string): string => {
    if (message.includes('<') || message.includes('>')) {
        return FALLBACK_EMAIL_ERROR;
    }

    return redactTokens(message);
};

const formatEmailError = (error: unknown): Record<string, unknown> => {
    if (error instanceof Error) {
        return { name: error.name, message: sanitizeEmailErrorMessage(error.message) };
    }

    if (error && typeof error === 'object') {
        const payload = error as Record<string, unknown>;
        const rawMessage = typeof payload.message === 'string' ? payload.message : FALLBACK_EMAIL_ERROR;
        return {
            message: sanitizeEmailErrorMessage(rawMessage),
            code: payload.code ?? payload.statusCode ?? payload.status,
        };
    }

    return { message: String(error) };
};

const logEmailError = async (type: AuthEmailType, to: string, error: unknown, userId?: number): Promise<void> => {
    try {
        await createLog(
            LogType.ERROR,
            LogOperation.CREATE,
            LogCategory.AUTH,
            {
                event: 'AUTH_EMAIL_SEND_FAILED',
                provider: 'resend',
                type,
                to,
                error: formatEmailError(error),
            },
            userId
        );
    } catch {
        // Ignore logging failures to avoid surfacing email errors to callers.
    }
};

const defaultSender: AuthEmailSender = async ({ type, to, link, userId, language }) => {
    if (!resend || !RESEND_FROM_EMAIL) {
        return;
    }

    const content = buildAuthEmailContent(type, language);
    const html = buildAuthEmailHtml(content, link);
    const text = buildAuthEmailText(content, link);

    try {
        const result = await resend.emails.send({
            from: RESEND_FROM_EMAIL,
            to,
            subject: content.subject,
            html,
            text,
        });

        if (result?.error) {
            await logEmailError(type, to, result.error, userId);
        }
    } catch (error) {
        await logEmailError(type, to, error, userId);
    }
};

const resolveSendOptions = (senderOrLanguage?: AuthEmailSender | LanguageCode, language?: LanguageCode) => {
    if (typeof senderOrLanguage === 'function') {
        return { sender: senderOrLanguage, language };
    }

    if (senderOrLanguage) {
        return { sender: defaultSender, language: senderOrLanguage };
    }

    return { sender: defaultSender, language };
};

export const buildEmailVerificationLink = (token: string): string => buildAuthLink('/verify-email', token);

export const buildPasswordResetLink = (token: string): string => buildAuthLink('/reset-password', token);

export async function sendEmailVerificationEmail(
    to: string,
    token: string,
    userId?: number,
    senderOrLanguage?: AuthEmailSender | LanguageCode,
    language?: LanguageCode
): Promise<void> {
    const link = buildEmailVerificationLink(token);
    const resolved = resolveSendOptions(senderOrLanguage, language);
    const payload: AuthEmailPayload = {
        type: 'email_verification',
        to,
        link,
        userId,
        ...(resolved.language ? { language: resolved.language } : {}),
    };

    await resolved.sender(payload);
}

export async function sendPasswordResetEmail(
    to: string,
    token: string,
    userId?: number,
    senderOrLanguage?: AuthEmailSender | LanguageCode,
    language?: LanguageCode
): Promise<void> {
    const link = buildPasswordResetLink(token);
    const resolved = resolveSendOptions(senderOrLanguage, language);
    const payload: AuthEmailPayload = {
        type: 'password_reset',
        to,
        link,
        userId,
        ...(resolved.language ? { language: resolved.language } : {}),
    };

    await resolved.sender(payload);
}
