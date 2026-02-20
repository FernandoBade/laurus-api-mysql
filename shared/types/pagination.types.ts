import type { SortOrder as SharedSortOrder } from '../enums/operator.enums';

/** @summary Pagination and sorting input parameters. */
export interface PaginationInput {
    page?: number;
    pageSize?: number;
    limit?: number;
    offset?: number;
    sort?: string;
    order?: SharedSortOrder;
}

/** @summary Pagination metadata for a list response. */
export interface PaginationMeta {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
}

/** @summary Paginated list response wrapper. */
export interface PaginatedResult<T> {
    data: T[];
    meta: PaginationMeta;
}

