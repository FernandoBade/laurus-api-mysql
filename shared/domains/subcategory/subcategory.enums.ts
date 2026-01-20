import { ResourceKey } from '../../i18n/resource.keys';

export enum SubcategoryErrorCode {
    ValidationError = ResourceKey.VALIDATION_ERROR,
    InvalidSubcategoryId = ResourceKey.INVALID_SUBCATEGORY_ID,
    InvalidCategoryId = ResourceKey.INVALID_CATEGORY_ID,
    InvalidUserId = ResourceKey.INVALID_USER_ID,
    CategoryNotFoundOrInactive = ResourceKey.CATEGORY_NOT_FOUND_OR_INACTIVE,
    UnauthorizedOperation = ResourceKey.UNAUTHORIZED_OPERATION,
    SubcategoryNotFound = ResourceKey.SUBCATEGORY_NOT_FOUND,
    NoRecordsFound = ResourceKey.NO_RECORDS_FOUND,
    InternalServerError = ResourceKey.INTERNAL_SERVER_ERROR,
}
