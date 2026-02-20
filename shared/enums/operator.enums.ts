/**
 * @summary Comparison and set operators used for repository-level filtering.
 */
export enum FilterOperator {
    EQ = "=",
    NE = "!=",
    GT = ">",
    LT = "<",
    GTE = ">=",
    LTE = "<=",
    LIKE = "LIKE",
    IN = "IN",
    BETWEEN = "BETWEEN",
}

/**
 * @summary Sort direction tokens used in list and pagination queries.
 */
export enum SortOrder {
    ASC = "asc",
    DESC = "desc",
}

/**
 * @summary SQL function tokens used by query builders for date-based expressions.
 */
export enum SqlFunction {
    DATE = "DATE",
    YEAR = "YEAR",
    MONTH = "MONTH",
}

