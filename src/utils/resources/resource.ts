import { INVALID } from "zod";

/**
 * All translation keys available in the app.
 * To add a new key, follow the pattern:
 * 1. Add the key to this enum.
 * 2. Add the key to the translation files in the respective language folder.
 * 3. Add the key to the `ResourceBase` class in `src/utils/resources/languages/resourceService.ts`.
 * 4. Add the key to the `Resource` type in `src/utils/resources/resource.ts`.
 * 5. Add the key to the `Resource` type in `src/utils/resources/resourceTypes.ts`.
 */
export const Resource = {
    EMAIL_IN_USE: "EMAIL_IN_USE",
    EXPIRED_OR_INVALID_TOKEN: 'EXPIRED_OR_INVALID_TOKEN',
    INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    INVALID_CRITERIA: "INVALID_CRITERIA",
    INVALID_JSON: "INVALID_JSON",
    INVALID_USER_ID: "INVALID_USER_ID",
    LOGOUT_ATTEMPT_WITH_MISSING_TOKEN: "LOGOUT_ATTEMPT_WITH_MISSING_TOKEN",
    NO_RECORDS_FOUND: "NO_RECORDS_FOUND",
    SEARCH_TERM_TOO_SHORT: "SEARCH_TERM_TOO_SHORT",
    TOKEN_NOT_FOUND: 'TOKEN_NOT_FOUND',
    USER_NOT_FOUND: "USER_NOT_FOUND",
    VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

export type Resource = keyof typeof Resource;
