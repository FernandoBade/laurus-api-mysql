import { ErrorMessages } from '../../enum';
import { Resource } from '../../resources/resource';

/**
 * Generic and standardized database response type.
 */
export type DbResponse<T> = {
    success: boolean;
    data?: T;
    error?: ErrorMessages | Resource;
};
