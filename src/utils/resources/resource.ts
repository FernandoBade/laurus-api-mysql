/**
 * All translation keys available in the app.
 */
export const Resource = {
    EMAIL_IN_USE: "EMAIL_IN_USE",
    USER_NOT_FOUND: "USER_NOT_FOUND",
    INVALID_USER_ID: "INVALID_USER_ID",
    VALIDATION_ERROR: "VALIDATION_ERROR",
    SEARCH_TERM_TOO_SHORT: "SEARCH_TERM_TOO_SHORT",
    INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
    NO_RECORDS_FOUND: "NO_RECORDS_FOUND",
    INVALID_JSON: "INVALID_JSON",
  } as const;

  export type Resource = keyof typeof Resource;
