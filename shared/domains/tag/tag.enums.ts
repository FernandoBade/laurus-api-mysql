import { ResourceKey } from '../../i18n/resource.keys';

/** @summary Tag-related error codes mapped to i18n resources. */
export enum TagErrorCode {
    ValidationError = ResourceKey.VALIDATION_ERROR,
    UserNotFound = ResourceKey.USER_NOT_FOUND,
    InternalServerError = ResourceKey.INTERNAL_SERVER_ERROR,
    InvalidTagId = ResourceKey.INVALID_TAG_ID,
    InvalidUserId = ResourceKey.INVALID_USER_ID,
    TagNotFound = ResourceKey.TAG_NOT_FOUND,
    DataAlreadyExists = ResourceKey.DATA_ALREADY_EXISTS,
}