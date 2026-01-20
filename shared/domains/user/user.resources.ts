import type {
    CreateUserInput,
    CreateUserOutput,
    DeleteUserInput,
    DeleteUserOutput,
    GetUserByIdInput,
    GetUserByIdOutput,
    GetUsersByEmailInput,
    GetUsersByEmailOutput,
    GetUsersInput,
    GetUsersOutput,
    UpdateUserRequest,
    UpdateUserOutput,
    UploadAvatarInput,
    UploadAvatarOutput,
} from './user.types';
import { UserErrorCode } from './user.enums';

export const createUserResource = {
    input: {} as CreateUserInput,
    output: {} as CreateUserOutput,
    errors: {} as UserErrorCode,
};

export const getUsersResource = {
    input: {} as GetUsersInput,
    output: {} as GetUsersOutput,
    errors: {} as UserErrorCode,
};

export const getUserByIdResource = {
    input: {} as GetUserByIdInput,
    output: {} as GetUserByIdOutput,
    errors: {} as UserErrorCode,
};

export const getUsersByEmailResource = {
    input: {} as GetUsersByEmailInput,
    output: {} as GetUsersByEmailOutput,
    errors: {} as UserErrorCode,
};

export const updateUserResource = {
    input: {} as UpdateUserRequest,
    output: {} as UpdateUserOutput,
    errors: {} as UserErrorCode,
};

export const deleteUserResource = {
    input: {} as DeleteUserInput,
    output: {} as DeleteUserOutput,
    errors: {} as UserErrorCode,
};

export const uploadAvatarResource = {
    input: {} as UploadAvatarInput,
    output: {} as UploadAvatarOutput,
    errors: {} as UserErrorCode,
};
