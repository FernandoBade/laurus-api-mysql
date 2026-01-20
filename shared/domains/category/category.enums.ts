import { ResourceKey } from '../../i18n/resource.keys';

export enum CategoryType {
    INCOME = 'income',
    EXPENSE = 'expense',
}

export enum CategoryColor {
    RED = 'red',
    BLUE = 'blue',
    GREEN = 'green',
    PURPLE = 'purple',
    YELLOW = 'yellow',
    ORANGE = 'orange',
    PINK = 'pink',
    GRAY = 'gray',
    CYAN = 'cyan',
    INDIGO = 'indigo',
}

export enum CategoryErrorCode {
    ValidationError = ResourceKey.VALIDATION_ERROR,
    UserNotFound = ResourceKey.USER_NOT_FOUND,
    InternalServerError = ResourceKey.INTERNAL_SERVER_ERROR,
    InvalidCategoryId = ResourceKey.INVALID_CATEGORY_ID,
    InvalidUserId = ResourceKey.INVALID_USER_ID,
    NoRecordsFound = ResourceKey.NO_RECORDS_FOUND,
    CategoryNotFound = ResourceKey.CATEGORY_NOT_FOUND,
}
