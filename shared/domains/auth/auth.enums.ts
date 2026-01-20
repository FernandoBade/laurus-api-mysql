import { ResourceKey } from '../../i18n/resource.keys';

export enum TokenType {
    REFRESH = 'refresh',
    EMAIL_VERIFICATION = 'email_verification',
    PASSWORD_RESET = 'password_reset',
}

export enum AuthErrorCode {
    InvalidCredentials = ResourceKey.INVALID_CREDENTIALS,
    EmailNotVerified = ResourceKey.EMAIL_NOT_VERIFIED,
    ExpiredOrInvalidToken = ResourceKey.EXPIRED_OR_INVALID_TOKEN,
    TokenNotFound = ResourceKey.TOKEN_NOT_FOUND,
    EmailInvalid = ResourceKey.EMAIL_INVALID,
    EmailVerificationCooldown = ResourceKey.EMAIL_VERIFICATION_COOLDOWN,
    PasswordTooShort = ResourceKey.PASSWORD_TOO_SHORT,
    InternalServerError = ResourceKey.INTERNAL_SERVER_ERROR,
}
