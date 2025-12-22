import { and, asc, desc, eq } from 'drizzle-orm';
import { RefreshTokenRepository } from '../../../src/repositories/refreshTokenRepository';
import { db } from '../../../src/db';
import { refreshTokens, SelectRefreshToken } from '../../../src/db/schema';
import { Operator } from '../../../src/utils/enum';

const makeRefreshToken = (overrides: Partial<SelectRefreshToken> = {}): SelectRefreshToken => {
    const now = new Date('2024-01-01T00:00:00Z');
    return {
        id: overrides.id ?? 1,
        token: overrides.token ?? 'token-1',
        expiresAt: overrides.expiresAt ?? now,
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

const makeDeleteChain = () => {
    const where = jest.fn().mockResolvedValue(undefined);
    const deleteSpy = jest.spyOn(db, 'delete').mockReturnValue({ where } as any);
    return { deleteSpy, where };
};

const expectSelectChain = (select: jest.SpyInstance, from: jest.Mock, table: unknown) => {
    expect(select).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith(table);
};

describe('RefreshTokenRepository', () => {
    let repo: RefreshTokenRepository;

    beforeEach(() => {
        repo = new RefreshTokenRepository();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('findById', () => {
        it('returns refresh token when found', async () => {
            const token = makeRefreshToken({ id: 1 });
            const { select, from, query } = makeSelectChain([token]);

            const result = await repo.findById(1);

            expectSelectChain(select, from, refreshTokens);
            expect(query.where).toHaveBeenCalledWith(eq(refreshTokens.id, 1));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(token);
        });

        it('returns null when not found', async () => {
            const { select, from, query } = makeSelectChain([]);

            const result = await repo.findById(99);

            expectSelectChain(select, from, refreshTokens);
            expect(query.where).toHaveBeenCalledWith(eq(refreshTokens.id, 99));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toBeNull();
        });
    });

    describe('findByToken', () => {
        it('returns refresh token when found', async () => {
            const token = makeRefreshToken({ token: 'token-123' });
            const { select, from, query } = makeSelectChain([token]);

            const result = await repo.findByToken('token-123');

            expectSelectChain(select, from, refreshTokens);
            expect(query.where).toHaveBeenCalledWith(eq(refreshTokens.token, 'token-123'));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(token);
        });

        it('returns null when not found', async () => {
            const { select, from, query } = makeSelectChain([]);

            const result = await repo.findByToken('missing');

            expectSelectChain(select, from, refreshTokens);
            expect(query.where).toHaveBeenCalledWith(eq(refreshTokens.token, 'missing'));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toBeNull();
        });
    });

    describe('findMany', () => {
        it('returns all refresh tokens when no filters', async () => {
            const list = [makeRefreshToken({ id: 1 }), makeRefreshToken({ id: 2 })];
            const { select, from, query } = makeSelectChain(list);

            const result = await repo.findMany();

            expectSelectChain(select, from, refreshTokens);
            expect(query.where).not.toHaveBeenCalled();
            expect(query.orderBy).not.toHaveBeenCalled();
            expect(query.limit).not.toHaveBeenCalled();
            expect(query.offset).not.toHaveBeenCalled();
            expect(result).toEqual(list);
        });

        it('applies userId filter', async () => {
            const { select, from, query } = makeSelectChain([makeRefreshToken({ id: 1, userId: 7 })]);

            await repo.findMany({ userId: { operator: Operator.EQUAL, value: 7 } });

            expectSelectChain(select, from, refreshTokens);
            expect(query.where).toHaveBeenCalledWith(and(eq(refreshTokens.userId, 7)));
        });

        it('applies sorting asc', async () => {
            const { select, from, query } = makeSelectChain([makeRefreshToken({ id: 1 })]);

            await repo.findMany(undefined, { sort: 'createdAt', order: 'asc' });

            expectSelectChain(select, from, refreshTokens);
            expect(query.orderBy).toHaveBeenCalledWith(asc(refreshTokens.createdAt));
        });

        it('applies sorting desc', async () => {
            const { select, from, query } = makeSelectChain([makeRefreshToken({ id: 1 })]);

            await repo.findMany(undefined, { sort: 'createdAt', order: 'desc' });

            expectSelectChain(select, from, refreshTokens);
            expect(query.orderBy).toHaveBeenCalledWith(desc(refreshTokens.createdAt));
        });

        it('applies pagination', async () => {
            const { select, from, query } = makeSelectChain([makeRefreshToken({ id: 1 })]);

            await repo.findMany(undefined, { limit: 5, offset: 10 });

            expectSelectChain(select, from, refreshTokens);
            expect(query.limit).toHaveBeenCalledWith(5);
            expect(query.offset).toHaveBeenCalledWith(10);
        });

        it('returns empty array when no results', async () => {
            const { select, from, query } = makeSelectChain([]);

            const result = await repo.findMany();

            expectSelectChain(select, from, refreshTokens);
            expect(query.where).not.toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe('count', () => {
        it('returns count when no filters', async () => {
            const { select, from, query } = makeSelectChain([{}, {}, {}]);

            const result = await repo.count();

            expectSelectChain(select, from, refreshTokens);
            expect(select).toHaveBeenCalledWith({ count: refreshTokens.id });
            expect(query.where).not.toHaveBeenCalled();
            expect(result).toBe(3);
        });

        it('applies filters to count', async () => {
            const { select, from, query } = makeSelectChain([{}, {}]);

            const result = await repo.count({ userId: { operator: Operator.EQUAL, value: 2 } });

            expectSelectChain(select, from, refreshTokens);
            expect(select).toHaveBeenCalledWith({ count: refreshTokens.id });
            expect(query.where).toHaveBeenCalledWith(and(eq(refreshTokens.userId, 2)));
            expect(result).toBe(2);
        });

        it('returns 0 when no results', async () => {
            const { select, from } = makeSelectChain([]);

            const result = await repo.count();

            expectSelectChain(select, from, refreshTokens);
            expect(select).toHaveBeenCalledWith({ count: refreshTokens.id });
            expect(result).toBe(0);
        });
    });

    describe('create', () => {
        it('inserts and returns created refresh token', async () => {
            const data = {
                token: 'token-123',
                expiresAt: new Date('2024-01-01T00:00:00Z'),
                userId: 4,
            };
            const created = makeRefreshToken({ id: 10, token: data.token, userId: 4 });
            const { insert, values } = makeInsertChain(10);
            const { select, from, query } = makeSelectChain([created]);

            const result = await repo.create(data);

            expect(insert).toHaveBeenCalledWith(refreshTokens);
            expect(values).toHaveBeenCalledWith(data);
            expectSelectChain(select, from, refreshTokens);
            expect(query.where).toHaveBeenCalledWith(eq(refreshTokens.id, 10));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(created);
        });

        it('throws invariant error when created record is missing', async () => {
            const data = {
                token: 'token-123',
                expiresAt: new Date('2024-01-01T00:00:00Z'),
                userId: 4,
            };
            const { insert, values } = makeInsertChain(12);
            const { select, from, query } = makeSelectChain([]);

            await expect(repo.create(data)).rejects.toThrow('RepositoryInvariantViolation: created record not found');

            expect(insert).toHaveBeenCalledWith(refreshTokens);
            expect(values).toHaveBeenCalledWith(data);
            expectSelectChain(select, from, refreshTokens);
            expect(query.where).toHaveBeenCalledWith(eq(refreshTokens.id, 12));
            expect(query.limit).toHaveBeenCalledWith(1);
        });
    });

    describe('delete', () => {
        it('executes delete query', async () => {
            const { deleteSpy, where } = makeDeleteChain();

            const result = await repo.delete(5);

            expect(deleteSpy).toHaveBeenCalledWith(refreshTokens);
            expect(where).toHaveBeenCalledWith(eq(refreshTokens.id, 5));
            expect(result).toBeUndefined();
        });
    });

    describe('deleteByToken', () => {
        it('executes delete by token query', async () => {
            const { deleteSpy, where } = makeDeleteChain();

            const result = await repo.deleteByToken('token-9');

            expect(deleteSpy).toHaveBeenCalledWith(refreshTokens);
            expect(where).toHaveBeenCalledWith(eq(refreshTokens.token, 'token-9'));
            expect(result).toBeUndefined();
        });
    });
});
