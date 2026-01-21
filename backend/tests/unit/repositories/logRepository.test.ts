import { and, asc, desc, eq } from 'drizzle-orm';
import { LogRepository } from '../../../src/repositories/logRepository';
import { db } from '../../../src/db';
import { logs, SelectLog } from '../../../src/db/schema';
import { LogCategory, LogOperation, LogType, Operator } from '../../../../shared/enums';

const makeLog = (overrides: Partial<SelectLog> = {}): SelectLog => {
    const now = new Date('2024-01-01T00:00:00Z');
    return {
        id: overrides.id ?? 1,
        type: overrides.type ?? LogType.ERROR,
        operation: overrides.operation ?? LogOperation.CREATE,
        category: overrides.category ?? LogCategory.LOG,
        detail: overrides.detail ?? 'detail',
        userId: overrides.userId ?? 1,
        createdAt: overrides.createdAt ?? now,
        updatedAt: overrides.updatedAt ?? now,
    };
};

const makeSelectQuery = <T,>(result: T) => {
    const query: any = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        then: (resolve: (value: T) => unknown, reject: (reason: unknown) => unknown) =>
            Promise.resolve(result).then(resolve, reject),
    };
    return query;
};

const makeSelectChain = <T,>(result: T) => {
    const query = makeSelectQuery(result);
    const from = jest.fn().mockReturnValue(query);
    const select = jest.spyOn(db, 'select').mockReturnValue({ from } as any);
    return { select, from, query };
};

const makeInsertChain = (insertId: number) => {
    const values = jest.fn().mockResolvedValue([{ insertId }]);
    const insert = jest.spyOn(db, 'insert').mockReturnValue({ values } as any);
    return { insert, values };
};

const expectSelectChain = (select: jest.SpyInstance, from: jest.Mock, table: unknown) => {
    expect(select).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith(table);
};

describe('LogRepository', () => {
    let repo: LogRepository;

    beforeEach(() => {
        repo = new LogRepository();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('findById', () => {
        it('returns log when found', async () => {
            const entry = makeLog({ id: 1 });
            const { select, from, query } = makeSelectChain([entry]);

            const result = await repo.findById(1);

            expectSelectChain(select, from, logs);
            expect(query.where).toHaveBeenCalledWith(eq(logs.id, 1));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(entry);
        });

        it('returns null when not found', async () => {
            const { select, from, query } = makeSelectChain([]);

            const result = await repo.findById(99);

            expectSelectChain(select, from, logs);
            expect(query.where).toHaveBeenCalledWith(eq(logs.id, 99));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toBeNull();
        });
    });

    describe('findMany', () => {
        it('returns all logs when no filters', async () => {
            const list = [makeLog({ id: 1 }), makeLog({ id: 2 })];
            const { select, from, query } = makeSelectChain(list);

            const result = await repo.findMany();

            expectSelectChain(select, from, logs);
            expect(query.where).not.toHaveBeenCalled();
            expect(query.orderBy).not.toHaveBeenCalled();
            expect(query.limit).not.toHaveBeenCalled();
            expect(query.offset).not.toHaveBeenCalled();
            expect(result).toEqual(list);
        });

        it('applies userId filter', async () => {
            const { select, from, query } = makeSelectChain([makeLog({ id: 1, userId: 7 })]);

            await repo.findMany({ userId: { operator: Operator.EQUAL, value: 7 } });

            expectSelectChain(select, from, logs);
            expect(query.where).toHaveBeenCalledWith(and(eq(logs.userId, 7)));
        });

        it('applies sorting asc', async () => {
            const { select, from, query } = makeSelectChain([makeLog({ id: 1 })]);

            await repo.findMany(undefined, { sort: 'createdAt', order: 'asc' });

            expectSelectChain(select, from, logs);
            expect(query.orderBy).toHaveBeenCalledWith(asc(logs.createdAt));
        });

        it('applies sorting desc', async () => {
            const { select, from, query } = makeSelectChain([makeLog({ id: 1 })]);

            await repo.findMany(undefined, { sort: 'createdAt', order: 'desc' });

            expectSelectChain(select, from, logs);
            expect(query.orderBy).toHaveBeenCalledWith(desc(logs.createdAt));
        });

        it('applies pagination', async () => {
            const { select, from, query } = makeSelectChain([makeLog({ id: 1 })]);

            await repo.findMany(undefined, { limit: 5, offset: 10 });

            expectSelectChain(select, from, logs);
            expect(query.limit).toHaveBeenCalledWith(5);
            expect(query.offset).toHaveBeenCalledWith(10);
        });

        it('returns empty array when no results', async () => {
            const { select, from, query } = makeSelectChain([]);

            const result = await repo.findMany();

            expectSelectChain(select, from, logs);
            expect(query.where).not.toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe('count', () => {
        it('returns count when no filters', async () => {
            const { select, from, query } = makeSelectChain([{}, {}, {}]);

            const result = await repo.count();

            expectSelectChain(select, from, logs);
            expect(select).toHaveBeenCalledWith({ count: logs.id });
            expect(query.where).not.toHaveBeenCalled();
            expect(result).toBe(3);
        });

        it('applies filters to count', async () => {
            const { select, from, query } = makeSelectChain([{}, {}]);

            const result = await repo.count({ userId: { operator: Operator.EQUAL, value: 2 } });

            expectSelectChain(select, from, logs);
            expect(select).toHaveBeenCalledWith({ count: logs.id });
            expect(query.where).toHaveBeenCalledWith(and(eq(logs.userId, 2)));
            expect(result).toBe(2);
        });

        it('returns 0 when no results', async () => {
            const { select, from } = makeSelectChain([]);

            const result = await repo.count();

            expectSelectChain(select, from, logs);
            expect(select).toHaveBeenCalledWith({ count: logs.id });
            expect(result).toBe(0);
        });
    });

    describe('create', () => {
        it('inserts and returns created log', async () => {
            const data = {
                type: LogType.ERROR,
                operation: LogOperation.CREATE,
                category: LogCategory.LOG,
                detail: 'detail',
                userId: 4,
            };
            const created = makeLog({ id: 10, userId: 4 });
            const { insert, values } = makeInsertChain(10);
            const { select, from, query } = makeSelectChain([created]);

            const result = await repo.create(data);

            expect(insert).toHaveBeenCalledWith(logs);
            expect(values).toHaveBeenCalledWith(data);
            expectSelectChain(select, from, logs);
            expect(query.where).toHaveBeenCalledWith(eq(logs.id, 10));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(created);
        });

        it('throws invariant error when created record is missing', async () => {
            const data = {
                type: LogType.ERROR,
                operation: LogOperation.CREATE,
                category: LogCategory.LOG,
                detail: 'detail',
                userId: 4,
            };
            const { insert, values } = makeInsertChain(12);
            const { select, from, query } = makeSelectChain([]);

            await expect(repo.create(data)).rejects.toThrow('RepositoryInvariantViolation: created record not found');

            expect(insert).toHaveBeenCalledWith(logs);
            expect(values).toHaveBeenCalledWith(data);
            expectSelectChain(select, from, logs);
            expect(query.where).toHaveBeenCalledWith(eq(logs.id, 12));
            expect(query.limit).toHaveBeenCalledWith(1);
        });
    });
});


