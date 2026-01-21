import { ResourceKey } from '../../i18n/resource.keys';

/** @summary Token classification used by auth flows. */
export enum TokenType {
    REFRESH = 'refresh',
    EMAIL_VERIFICATION = 'emailVerification',
    PASSWORD_RESET = 'passwordReset',
}

/** @summary Auth-related error codes mapped to i18n resources. */
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