import type { Currency, DateFormat, Language, Profile, Theme } from './user.enums';
import type { FileUpload } from '../../types/file.types';
import type { PaginationInput, PaginatedResult } from '../../types/pagination.types';

export type UserId = number;
export type EmailAddress = string;
export type UserName = string;
export type Password = string;
export type PhoneNumber = string;
export type AvatarUrl = string;

export interface UserEntity {
    id: UserId;
    firstName: UserName | null;
    lastName: UserName | null;
    email: EmailAddress;
    password: Password | null;
    birthDate: Date | null;
    phone: PhoneNumber | null;
    avatarUrl: AvatarUrl | null;
    theme: Theme;
    language: Language;
    currency: Currency;
    dateFormat: DateFormat;
    profile: Profile;
    hideValues: boolean;
    active: boolean;
    emailVerifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export type SanitizedUser = Omit<UserEntity, 'password'>;

export interface CreateUserInput {
    firstName: UserName;
    lastName: UserName;
    email: EmailAddress;
    password: Password;
    phone?: PhoneNumber;
    birthDate?: Date;
    theme?: Theme;
    language?: Language;
    currency?: Currency;
    dateFormat?: DateFormat;
    profile?: Profile;
    hideValues?: boolean;
    active?: boolean;
}

export interface UpdateUserInput {
    firstName?: UserName;
    lastName?: UserName;
    email?: EmailAddress;
    password?: Password;
    phone?: PhoneNumber;
    birthDate?: Date;
    theme?: Theme;
    language?: Language;
    currency?: Currency;
    dateFormat?: DateFormat;
    profile?: Profile;
    hideValues?: boolean;
    active?: boolean;
}

export interface GetUsersInput extends PaginationInput {}

export interface GetUserByIdInput {
    id: UserId;
}

export interface GetUsersByEmailInput extends PaginationInput {
    email: EmailAddress;
}

export interface UpdateUserRequest {
    id: UserId;
    data: UpdateUserInput;
}

export interface DeleteUserInput {
    id: UserId;
}

export interface UploadAvatarInput {
    file: FileUpload;
}

export type CreateUserOutput = SanitizedUser;
export type GetUsersOutput = PaginatedResult<SanitizedUser>;
export type GetUserByIdOutput = SanitizedUser;
export type GetUsersByEmailOutput = PaginatedResult<SanitizedUser>;
export type UpdateUserOutput = SanitizedUser;
export interface DeleteUserOutput {
    id: UserId;
}
export interface UploadAvatarOutput {
    url: AvatarUrl;
}
