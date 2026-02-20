import { SortOrder } from '../../../shared/enums/operator.enums';

type QueryParamValue = string | string[] | number | undefined;
type QueryParams = Record<string, unknown>;

const getQueryValue = (query: QueryParams, key: string): QueryParamValue => {
    const raw = query[key];
    if (typeof raw === 'string' || typeof raw === 'number' || raw === undefined) {
        return raw;
    }
    if (Array.isArray(raw)) {
        const first = raw[0];
        if (typeof first === 'string') {
            return first;
        }
    }
    return undefined;
};

const parseQueryInt = (value: QueryParamValue): number => {
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string') {
        return parseInt(value);
    }
    return NaN;
};

export type QueryOptions<T = Record<string, unknown>> = {
    limit?: number;
    offset?: number;
    sort?: keyof T | string;
    order?: SortOrder;
};

export function parsePagination(query: QueryParams) {
    const pageValue = getQueryValue(query, 'page');
    const pageSizeValue = getQueryValue(query, 'pageSize');
    const limitValue = getQueryValue(query, 'limit');
    const offsetValue = getQueryValue(query, 'offset');
    const sortValue = getQueryValue(query, 'sort');
    const orderValue = getQueryValue(query, 'order');

    const page = Math.max(parseQueryInt(pageValue) || 1, 1);
    const pageSize = Math.max(parseQueryInt(pageSizeValue) || parseQueryInt(limitValue) || 10, 1);
    const limit = limitValue ? parseQueryInt(limitValue) : pageSize;
    const offset = offsetValue ? parseQueryInt(offsetValue) : (page - 1) * pageSize;
    const sort = typeof sortValue === 'string' ? sortValue : undefined;
    const orderParam = typeof orderValue === 'string' ? orderValue.toLowerCase() : undefined;
    const order = orderParam === SortOrder.DESC ? SortOrder.DESC : SortOrder.ASC;
    return { page, pageSize, limit, offset, sort, order };
}

export function buildMeta({ page, pageSize, total }: { page: number; pageSize: number; total: number }) {
    const pageCount = pageSize ? Math.ceil(total / pageSize) : 0;
    return { page, pageSize, total, pageCount };
}



