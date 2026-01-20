import { buildMeta, parsePagination } from '../../../src/utils/pagination';
import { Operator } from '../../../../shared/enums';

describe('pagination utils', () => {
    describe('parsePagination', () => {
        it('parses page, pageSize, sort and desc order', () => {
            const result = parsePagination({
                page: '2',
                pageSize: '5',
                sort: 'name',
                order: 'desc',
            });

            expect(result).toEqual({
                page: 2,
                pageSize: 5,
                limit: 5,
                offset: 5,
                sort: 'name',
                order: Operator.DESC,
            });
        });

        it('respects limit and offset when provided', () => {
            const result = parsePagination({
                page: '1',
                limit: '15',
                offset: '30',
                order: 'asc',
            });

            expect(result).toEqual({
                page: 1,
                pageSize: 15,
                limit: 15,
                offset: 30,
                sort: undefined,
                order: Operator.ASC,
            });
        });

        it('uses defaults when query is empty', () => {
            const result = parsePagination({});

            expect(result).toEqual({
                page: 1,
                pageSize: 10,
                limit: 10,
                offset: 0,
                sort: undefined,
                order: Operator.ASC,
            });
        });
    });

    describe('buildMeta', () => {
        it('calculates page count', () => {
            expect(buildMeta({ page: 2, pageSize: 5, total: 11 })).toEqual({
                page: 2,
                pageSize: 5,
                total: 11,
                pageCount: 3,
            });
        });

        it('returns zero pageCount when pageSize is zero', () => {
            expect(buildMeta({ page: 1, pageSize: 0, total: 10 })).toEqual({
                page: 1,
                pageSize: 0,
                total: 10,
                pageCount: 0,
            });
        });
    });
});
