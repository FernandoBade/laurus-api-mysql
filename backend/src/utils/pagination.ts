import { Operator } from '../../../shared/enums';

export type QueryOptions<T = any> = {
    limit?: number;
    offset?: number;
    sort?: keyof T | string;
    order?: Operator;
};

export function parsePagination(query: any) {
    const page = Math.max(parseInt(query.page as string) || 1, 1);
    const pageSize = Math.max(parseInt(query.pageSize as string) || parseInt(query.limit as string) || 10, 1);
    const limit = query.limit ? parseInt(query.limit as string) : pageSize;
    const offset = query.offset ? parseInt(query.offset as string) : (page - 1) * pageSize;
    const sort = query.sort as string | undefined;
    const orderParam = (query.order as string | undefined)?.toLowerCase();
    const order = orderParam === 'desc' ? Operator.DESC : Operator.ASC;
    return { page, pageSize, limit, offset, sort, order };
}

export function buildMeta({ page, pageSize, total }: { page: number; pageSize: number; total: number }) {
    const pageCount = pageSize ? Math.ceil(total / pageSize) : 0;
    return { page, pageSize, total, pageCount };
}


