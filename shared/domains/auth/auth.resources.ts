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

export const loginResource = {
    input: {} as LoginInput,
    output: {} as LoginOutput,
    errors: {} as AuthErrorCode,
};

export const refreshResource = {
    input: {} as RefreshInput,
    output: {} as RefreshOutput,
    errors: {} as AuthErrorCode,
};

export const logoutResource = {
    input: {} as LogoutInput,
    output: {} as LogoutOutput,
    errors: {} as AuthErrorCode,
};

export const verifyEmailResource = {
    input: {} as VerifyEmailInput,
    output: {} as VerifyEmailOutput,
    errors: {} as AuthErrorCode,
};

export const resendVerificationEmailResource = {
    input: {} as ResendVerificationEmailInput,
    output: {} as ResendVerificationEmailOutput,
    errors: {} as AuthErrorCode,
};

export const forgotPasswordResource = {
    input: {} as ForgotPasswordInput,
    output: {} as ForgotPasswordOutput,
    errors: {} as AuthErrorCode,
};

export const resetPasswordResource = {
    input: {} as ResetPasswordInput,
    output: {} as ResetPasswordOutput,
    errors: {} as AuthErrorCode,
};
