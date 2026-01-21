import type { EmailAddress, Password, UserEntity, UserId } from '../user/user.types';

/** @summary Input payload for login. */
export interface LoginInput {
    email: EmailAddress;
    password: Password;
}

/** @summary Output payload for login. */
export interface LoginOutput {
    token: string;
}

/** @summary Context data returned after login. */
export interface LoginContext {
    token: string;
    refreshToken: string;
    user: UserEntity;
}

/** @summary Input payload for refreshing tokens. */
export interface RefreshInput {
    refreshToken: string;
}

/** @summary Output payload for refreshing tokens. */
export interface RefreshOutput {
    token: string;
}

/** @summary Context data returned after refresh. */
export interface RefreshContext {
    token: string;
    refreshToken: string;
}

/** @summary Input payload for logout. */
export interface LogoutInput {
    refreshToken: string;
}

/** @summary Output payload for logout. */
export type LogoutOutput = Record<string, never>;

/** @summary Context data for logout operations. */
export interface LogoutContext {
    userId: UserId;
}

/** @summary Input payload for verifying email. */
export interface VerifyEmailInput {
    token: string;
}

/** @summary Output payload for verifying email. */
export interface VerifyEmailOutput {
    verified: true;
    alreadyVerified?: boolean;
}

/** @summary Input payload for resending verification email. */
export interface ResendVerificationEmailInput {
    email: EmailAddress;
}

/** @summary Output payload for resending verification email. */
export interface ResendVerificationEmailOutput {
    sent: true;
}

/** @summary Input payload for forgot password requests. */
export interface ForgotPasswordInput {
    email: EmailAddress;
}

/** @summary Output payload for forgot password requests. */
export interface ForgotPasswordOutput {
    sent: true;
}

/** @summary Input payload for resetting password. */
export interface ResetPasswordInput {
    token: string;
    password: Password;
}

/** @summary Output payload for resetting password. */
export interface ResetPasswordOutput {
    reset: true;
}