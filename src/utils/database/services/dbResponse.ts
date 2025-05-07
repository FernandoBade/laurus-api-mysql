import { Resource } from '../../resources/resource';

/**
 * Generic and standardized return type for all database operations.
 * Encapsulates success state, data when applicable, and error messages based on i18n resources.
 */
export type DbResponse<T> = {
    success: boolean;
    data?: T;
    error?: Resource;
};
