/**
 * Utilities for handling pagination in HTTP requests.
 */

/** Sort direction supported by pagination. */
export type SortOrder = 'asc' | 'desc';

/**
 * Parsed pagination parameters.
 */
export interface Pagination {
    page: number;
    pageSize: number;
    limit: number;
    offset: number;
    sort?: string;
    order?: SortOrder;
}

/**
 * Parses pagination information from a query object.
 *
 * @param query - The request query parameters.
 * @returns Pagination data with defaults applied.
 */
export function parsePagination(query: Record<string, unknown>): Pagination {
    const DEFAULT_PAGE = 1;
    const DEFAULT_PAGE_SIZE = 20;
    const MAX_PAGE_SIZE = 100;

    let page = Number(query.page) || DEFAULT_PAGE;
    page = page > 0 ? page : DEFAULT_PAGE;

    let pageSize = Number(query.pageSize) || DEFAULT_PAGE_SIZE;
    pageSize = pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;
    pageSize = Math.min(pageSize, MAX_PAGE_SIZE);

    const sort = typeof query.sort === 'string' && query.sort.length > 0 ? query.sort : undefined;

    const orderParam = typeof query.order === 'string' ? query.order.toLowerCase() : undefined;
    const order: SortOrder = orderParam === 'asc' ? 'asc' : 'desc';

    const offset = (page - 1) * pageSize;

    return {
        page,
        pageSize,
        limit: pageSize,
        offset,
        ...(sort ? { sort } : {}),
        order
    };
}

/**
 * Builds pagination metadata for API responses.
 *
 * @param params - Current pagination data and total item count.
 * @returns Metadata including total pages and navigation flags.
 */
export function buildMeta({ page, pageSize, total }: { page: number; pageSize: number; total: number }) {
    const totalPages = Math.ceil(total / pageSize);

    return {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
}

