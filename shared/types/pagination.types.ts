export type SortOrder = 'asc' | 'desc';

export interface PaginationInput {
    page?: number;
    pageSize?: number;
    limit?: number;
    offset?: number;
    sort?: string;
    order?: SortOrder;
}

export interface PaginationMeta {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
}

export interface PaginatedResult<T> {
    data: T[];
    meta: PaginationMeta;
}
