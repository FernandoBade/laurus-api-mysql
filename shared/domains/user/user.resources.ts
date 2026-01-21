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

/** @summary Resource definition for creating a user. */
export const createUserResource = {
    input: {} as CreateUserInput,
    output: {} as CreateUserOutput,
    errors: {} as UserErrorCode,
};

/** @summary Resource definition for listing users. */
export const getUsersResource = {
    input: {} as GetUsersInput,
    output: {} as GetUsersOutput,
    errors: {} as UserErrorCode,
};

/** @summary Resource definition for fetching a user by id. */
export const getUserByIdResource = {
    input: {} as GetUserByIdInput,
    output: {} as GetUserByIdOutput,
    errors: {} as UserErrorCode,
};

/** @summary Resource definition for searching users by email. */
export const getUsersByEmailResource = {
    input: {} as GetUsersByEmailInput,
    output: {} as GetUsersByEmailOutput,
    errors: {} as UserErrorCode,
};

/** @summary Resource definition for updating a user. */
export const updateUserResource = {
    input: {} as UpdateUserRequest,
    output: {} as UpdateUserOutput,
    errors: {} as UserErrorCode,
};

/** @summary Resource definition for deleting a user. */
export const deleteUserResource = {
    input: {} as DeleteUserInput,
    output: {} as DeleteUserOutput,
    errors: {} as UserErrorCode,
};

/** @summary Resource definition for uploading a user avatar. */
export const uploadAvatarResource = {
    input: {} as UploadAvatarInput,
    output: {} as UploadAvatarOutput,
    errors: {} as UserErrorCode,
};