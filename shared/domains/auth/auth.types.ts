import type { EmailAddress, Password, UserEntity } from '../user/user.types';

export interface LoginInput {
    email: EmailAddress;
    password: Password;
}

export interface LoginOutput {
    token: string;
}

export interface LoginContext {
    token: string;
    refreshToken: string;
    user: UserEntity;
}

export interface RefreshInput {
    refreshToken: string;
}

export interface RefreshOutput {
    token: string;
}

export interface RefreshContext {
    token: string;
    refreshToken: string;
}

export interface LogoutInput {
    refreshToken: string;
}

export type LogoutOutput = Record<string, never>;

export interface LogoutContext {
    userId: number;
}

export interface VerifyEmailInput {
    token: string;
}

export interface VerifyEmailOutput {
    verified: true;
    alreadyVerified?: boolean;
}

export interface ResendVerificationEmailInput {
    email: EmailAddress;
}

export interface ResendVerificationEmailOutput {
    sent: true;
}

export interface ForgotPasswordInput {
    email: EmailAddress;
}

export interface ForgotPasswordOutput {
    sent: true;
}

export interface ResetPasswordInput {
    token: string;
    password: Password;
}

export interface ResetPasswordOutput {
    reset: true;
}
