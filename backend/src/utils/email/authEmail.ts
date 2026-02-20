import { Resend } from 'resend';
import { createLog } from '../commons';
import { TokenType } from '../../../../shared/enums/auth.enums';
import { EmailProvider } from '../../../../shared/enums/email.enums';
import { LogCategory, LogEvent, LogOperation, LogType } from '../../../../shared/enums/log.enums';
import { ResourceKey as Resource } from '../../../../shared/i18n/resource.keys';
import { translateResource } from '../../../../shared/i18n/resource.utils';

type AuthEmailType = TokenType.EMAIL_VERIFICATION | TokenType.PASSWORD_RESET;

type AuthEmailPayload = {
    type: AuthEmailType;
    to: string;
    link: string;
    userId?: number;
};

export type AuthEmailSender = (payload: AuthEmailPayload) => Promise<void>;

type AuthEmailContent = {
    subject: string;
    body: string;
    warning?: string;
    linkLabel: string;
};

const BASE_URL = (process.env.FRONTEND_BASE_URL ?? '').replace(/\/$/, '');
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const buildAuthLink = (path: string, token: string): string => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const encodedToken = encodeURIComponent(token);
    const link = `${normalizedPath}?token=${encodedToken}`;
    return BASE_URL ? `${BASE_URL}${link}` : link;
};

const buildAuthEmailContent = (type: AuthEmailType): AuthEmailContent => {
    if (type === TokenType.EMAIL_VERIFICATION) {
        return {
            subject: translateResource(Resource.EMAIL_VERIFICATION_SUBJECT),
            body: translateResource(Resource.EMAIL_VERIFICATION_BODY),
            linkLabel: translateResource(Resource.EMAIL_LINK_LABEL),
        };
    }

    return {
        subject: translateResource(Resource.PASSWORD_RESET_SUBJECT),
        body: translateResource(Resource.PASSWORD_RESET_BODY),
        warning: translateResource(Resource.PASSWORD_RESET_WARNING),
        linkLabel: translateResource(Resource.EMAIL_LINK_LABEL),
    };
};

const buildAuthEmailHtml = (content: AuthEmailContent, link: string): string => {
    const warningBlock = content.warning
        ? `<p style="margin:0 0 12px;line-height:1.5;color:#555;">${content.warning}</p>`
        : '';

    return `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f5f5f5;">
    <div style="max-width:600px;margin:0 auto;padding:24px;font-family:Arial,sans-serif;color:#111;">
      <div style="background:#ffffff;border-radius:8px;padding:24px;">
        <h1 style="font-size:20px;margin:0 0 12px;">${content.subject}</h1>
        <p style="margin:0 0 16px;line-height:1.5;">${content.body}</p>
        <p style="margin:0 0 8px;line-height:1.5;color:#555;">${content.linkLabel}</p>
        <p style="margin:0 0 16px;word-break:break-word;">
          <a href="${link}" style="color:#111;">${link}</a>
        </p>
        ${warningBlock}
      </div>
    </div>
  </body>
</html>`.trim();
};

const buildAuthEmailText = (content: AuthEmailContent, link: string): string => {
    const lines = [
        content.subject,
        '',
        content.body,
        '',
        `${content.linkLabel} ${link}`,
    ];

    if (content.warning) {
        lines.push('', content.warning);
    }

    return lines.join('\n');
};

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

const logEmailError = async (type: AuthEmailType, error: unknown, userId?: number): Promise<void> => {
    try {
        await createLog(
            LogType.ERROR,
            LogOperation.CREATE,
            LogCategory.AUTH,
            {
                event: LogEvent.AUTH_EMAIL_SEND_FAILED,
                provider: EmailProvider.RESEND,
                type,
                error: formatEmailError(error),
            },
            userId
        );
    } catch {
        // Ignore logging errors to avoid surfacing email issues.
    }
};

const logConfigError = async (type: AuthEmailType, userId?: number): Promise<void> => {
    await logEmailError(type, new Error('Resend configuration missing'), userId);
};

const defaultSender: AuthEmailSender = async ({ type, to, link, userId }) => {
    if (!resend || !RESEND_FROM_EMAIL) {
        await logConfigError(type, userId);
        return;
    }

    const content = buildAuthEmailContent(type);
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
            await logEmailError(type, result.error, userId);
        }
    } catch (error) {
        await logEmailError(type, error, userId);
    }
};

export const buildEmailVerificationLink = (token: string): string => buildAuthLink('/verify-email', token);

export const buildPasswordResetLink = (token: string): string => buildAuthLink('/reset-password', token);

export async function sendEmailVerificationEmail(to: string, token: string, userId?: number, sender: AuthEmailSender = defaultSender): Promise<void> {
    const link = buildEmailVerificationLink(token);
    await sender({ type: TokenType.EMAIL_VERIFICATION, to, link, userId });
}

export async function sendPasswordResetEmail(to: string, token: string, userId?: number, sender: AuthEmailSender = defaultSender): Promise<void> {
    const link = buildPasswordResetLink(token);
    await sender({ type: TokenType.PASSWORD_RESET, to, link, userId });
}

