import type {
    ForgotPasswordInput,
    ForgotPasswordOutput,
    LoginInput,
    LoginOutput,
    LogoutInput,
    LogoutOutput,
    RefreshInput,
    RefreshOutput,
    ResendVerificationEmailInput,
    ResendVerificationEmailOutput,
    ResetPasswordInput,
    ResetPasswordOutput,
    VerifyEmailInput,
    VerifyEmailOutput,
} from './auth.types';
import { AuthErrorCode } from './auth.enums';

/** @summary Resource definition for login. */
export const loginResource = {
    input: {} as LoginInput,
    output: {} as LoginOutput,
    errors: {} as AuthErrorCode,
};

/** @summary Resource definition for token refresh. */
export const refreshResource = {
    input: {} as RefreshInput,
    output: {} as RefreshOutput,
    errors: {} as AuthErrorCode,
};

/** @summary Resource definition for logout. */
export const logoutResource = {
    input: {} as LogoutInput,
    output: {} as LogoutOutput,
    errors: {} as AuthErrorCode,
};

/** @summary Resource definition for email verification. */
export const verifyEmailResource = {
    input: {} as VerifyEmailInput,
    output: {} as VerifyEmailOutput,
    errors: {} as AuthErrorCode,
};

/** @summary Resource definition for resending verification email. */
export const resendVerificationEmailResource = {
    input: {} as ResendVerificationEmailInput,
    output: {} as ResendVerificationEmailOutput,
    errors: {} as AuthErrorCode,
};

/** @summary Resource definition for forgot password requests. */
export const forgotPasswordResource = {
    input: {} as ForgotPasswordInput,
    output: {} as ForgotPasswordOutput,
    errors: {} as AuthErrorCode,
};

/** @summary Resource definition for resetting password. */
export const resetPasswordResource = {
    input: {} as ResetPasswordInput,
    output: {} as ResetPasswordOutput,
    errors: {} as AuthErrorCode,
};