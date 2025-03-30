import { ErrorMessages } from '../../enum';

/**
 * Generic and standardized database response type.
 */
export type DbResponse<T> = {
    success: boolean;
    data?: T;
    error?: ErrorMessages;
};
