import { ResourceKey } from '../../i18n/resource.keys';

/** @summary Feedback-related error codes mapped to i18n resources. */
export enum FeedbackErrorCode {
    ValidationError = ResourceKey.VALIDATION_ERROR,
    ExpiredOrInvalidToken = ResourceKey.EXPIRED_OR_INVALID_TOKEN,
    UserNotFound = ResourceKey.USER_NOT_FOUND,
    FeedbackSendFailed = ResourceKey.FEEDBACK_SEND_FAILED,
    InternalServerError = ResourceKey.INTERNAL_SERVER_ERROR,
}