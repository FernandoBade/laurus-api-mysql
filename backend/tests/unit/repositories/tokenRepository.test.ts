import { and, asc, desc, eq, isNull } from 'drizzle-orm';
import { TokenRepository } from '../../../src/repositories/tokenRepository';
import { db } from '../../../src/db';
import { tokens, SelectToken } from '../../../src/db/schema';
import { Operator, TokenType } from '../../../../shared/enums';

const makeToken = (overrides: Partial<SelectToken> = {}): SelectToken => {
    const now = new Date('2024-01-01T00:00:00Z');
    return {
        id: overrides.id ?? 1,
        tokenHash: overrides.tokenHash ?? 'token-hash-1',
        type: overrides.type ?? TokenType.REFRESH,
        expiresAt: overrides.expiresAt ?? now,
        userId: overrides.userId ?? 1,
        sessionId: overrides.sessionId ?? 'session-id',
        sessionExpiresAt: overrides.sessionExpiresAt ?? now,
        revokedAt: overrides.revokedAt ?? null,
        createdAt: overrides.createdAt ?? now,
        updatedAt: overrides.updatedAt ?? now,
    };
};

const makeSelectQuery = <T,>(result: T) => {
    const query = {
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
    const select = jest.spyOn(db, 'select').mockReturnValue({ from } as unknown as ReturnType<typeof db.select>);
    return { select, from, query };
};

const makeInsertChain = (insertId: number) => {
    const values = jest.fn().mockResolvedValue([{ insertId }]);
    const insert = jest.spyOn(db, 'insert').mockReturnValue({ values } as unknown as ReturnType<typeof db.insert>);
    return { insert, values };
};

const makeDeleteChain = (affectedRows = 1) => {
    const where = jest.fn().mockResolvedValue([{ affectedRows }]);
    const deleteSpy = jest.spyOn(db, 'delete').mockReturnValue({ where } as unknown as ReturnType<typeof db.delete>);
    return { deleteSpy, where };
};

const makeUpdateChain = (affectedRows = 1) => {
    const where = jest.fn().mockResolvedValue([{ affectedRows }]);
    const set = jest.fn().mockReturnValue({ where });
    const updateSpy = jest.spyOn(db, 'update').mockReturnValue({ set } as unknown as ReturnType<typeof db.update>);
    return { updateSpy, set, where };
};

const expectSelectChain = (select: jest.SpyInstance, from: jest.Mock, table: unknown) => {
    expect(select).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith(table);
};

describe('TokenRepository', () => {
    let repo: TokenRepository;

    beforeEach(() => {
        repo = new TokenRepository();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('findById', () => {
        it('returns token when found', async () => {
            const token = makeToken({ id: 1 });
            const { select, from, query } = makeSelectChain([token]);

            const result = await repo.findById(1);

            expectSelectChain(select, from, tokens);
            expect(query.where).toHaveBeenCalledWith(eq(tokens.id, 1));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(token);
        });

        it('returns null when not found', async () => {
            const { select, from, query } = makeSelectChain([]);

            const result = await repo.findById(99);

            expectSelectChain(select, from, tokens);
            expect(query.where).toHaveBeenCalledWith(eq(tokens.id, 99));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toBeNull();
        });
    });

    describe('findByTokenHash', () => {
        it('returns token when found', async () => {
            const token = makeToken({ tokenHash: 'token-123' });
            const { select, from, query } = makeSelectChain([token]);

            const result = await repo.findByTokenHash('token-123');

            expectSelectChain(select, from, tokens);
            expect(query.where).toHaveBeenCalledWith(and(eq(tokens.tokenHash, 'token-123'), eq(tokens.type, TokenType.REFRESH)));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(token);
        });

        it('returns null when not found', async () => {
            const { select, from, query } = makeSelectChain([]);

            const result = await repo.findByTokenHash('missing');

            expectSelectChain(select, from, tokens);
            expect(query.where).toHaveBeenCalledWith(and(eq(tokens.tokenHash, 'missing'), eq(tokens.type, TokenType.REFRESH)));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toBeNull();
        });
    });

    describe('findByTokenHashAndType', () => {
        it('returns token when found', async () => {
            const token = makeToken({ tokenHash: 'token-456', type: TokenType.EMAIL_VERIFICATION });
            const { select, from, query } = makeSelectChain([token]);

            const result = await repo.findByTokenHashAndType('token-456', TokenType.EMAIL_VERIFICATION);

            expectSelectChain(select, from, tokens);
            expect(query.where).toHaveBeenCalledWith(and(eq(tokens.tokenHash, 'token-456'), eq(tokens.type, TokenType.EMAIL_VERIFICATION)));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(token);
        });

        it('returns null when not found', async () => {
            const { select, from, query } = makeSelectChain([]);

            const result = await repo.findByTokenHashAndType('missing', TokenType.PASSWORD_RESET);

            expectSelectChain(select, from, tokens);
            expect(query.where).toHaveBeenCalledWith(and(eq(tokens.tokenHash, 'missing'), eq(tokens.type, TokenType.PASSWORD_RESET)));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toBeNull();
        });
    });

    describe('findMany', () => {
        it('returns all tokens when no filters', async () => {
            const list = [makeToken({ id: 1 }), makeToken({ id: 2 })];
            const { select, from, query } = makeSelectChain(list);

            const result = await repo.findMany();

            expectSelectChain(select, from, tokens);
            expect(query.where).toHaveBeenCalledWith(and(eq(tokens.type, TokenType.REFRESH)));
            expect(query.orderBy).not.toHaveBeenCalled();
            expect(query.limit).not.toHaveBeenCalled();
            expect(query.offset).not.toHaveBeenCalled();
            expect(result).toEqual(list);
        });

        it('applies userId filter', async () => {
            const { select, from, query } = makeSelectChain([makeToken({ id: 1, userId: 7 })]);

            await repo.findMany({ userId: { operator: Operator.EQUAL, value: 7 } });

            expectSelectChain(select, from, tokens);
            expect(query.where).toHaveBeenCalledWith(and(eq(tokens.type, TokenType.REFRESH), eq(tokens.userId, 7)));
        });

        it('applies sorting asc', async () => {
            const { select, from, query } = makeSelectChain([makeToken({ id: 1 })]);

            await repo.findMany(undefined, { sort: 'createdAt', order: 'asc' });

            expectSelectChain(select, from, tokens);
            expect(query.orderBy).toHaveBeenCalledWith(asc(tokens.createdAt));
        });

        it('applies sorting desc', async () => {
            const { select, from, query } = makeSelectChain([makeToken({ id: 1 })]);

            await repo.findMany(undefined, { sort: 'createdAt', order: 'desc' });

            expectSelectChain(select, from, tokens);
            expect(query.orderBy).toHaveBeenCalledWith(desc(tokens.createdAt));
        });

        it('applies pagination', async () => {
            const { select, from, query } = makeSelectChain([makeToken({ id: 1 })]);

            await repo.findMany(undefined, { limit: 5, offset: 10 });

            expectSelectChain(select, from, tokens);
            expect(query.limit).toHaveBeenCalledWith(5);
            expect(query.offset).toHaveBeenCalledWith(10);
        });

        it('returns empty array when no results', async () => {
            const { select, from, query } = makeSelectChain([]);

            const result = await repo.findMany();

            expectSelectChain(select, from, tokens);
            expect(query.where).toHaveBeenCalledWith(and(eq(tokens.type, TokenType.REFRESH)));
            expect(result).toEqual([]);
        });
    });

    describe('count', () => {
        it('returns count when no filters', async () => {
            const { select, from, query } = makeSelectChain([{}, {}, {}]);

            const result = await repo.count();

            expectSelectChain(select, from, tokens);
            expect(select).toHaveBeenCalledWith({ count: tokens.id });
            expect(query.where).toHaveBeenCalledWith(and(eq(tokens.type, TokenType.REFRESH)));
            expect(result).toBe(3);
        });

        it('applies filters to count', async () => {
            const { select, from, query } = makeSelectChain([{}, {}]);

            const result = await repo.count({ userId: { operator: Operator.EQUAL, value: 2 } });

            expectSelectChain(select, from, tokens);
            expect(select).toHaveBeenCalledWith({ count: tokens.id });
            expect(query.where).toHaveBeenCalledWith(and(eq(tokens.type, TokenType.REFRESH), eq(tokens.userId, 2)));
            expect(result).toBe(2);
        });

        it('returns 0 when no results', async () => {
            const { select, from, query } = makeSelectChain([]);

            const result = await repo.count();

            expectSelectChain(select, from, tokens);
            expect(select).toHaveBeenCalledWith({ count: tokens.id });
            expect(query.where).toHaveBeenCalledWith(and(eq(tokens.type, TokenType.REFRESH)));
            expect(result).toBe(0);
        });
    });

    describe('create', () => {
        it('inserts and returns created token', async () => {
            const data = {
                tokenHash: 'token-hash-123',
                type: TokenType.REFRESH,
                expiresAt: new Date('2024-01-01T00:00:00Z'),
                userId: 4,
            };
            const created = makeToken({ id: 10, tokenHash: data.tokenHash, userId: 4 });
            const { insert, values } = makeInsertChain(10);
            const { select, from, query } = makeSelectChain([created]);

            const result = await repo.create(data);

            expect(insert).toHaveBeenCalledWith(tokens);
            expect(values).toHaveBeenCalledWith(data);
            expectSelectChain(select, from, tokens);
            expect(query.where).toHaveBeenCalledWith(eq(tokens.id, 10));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(created);
        });

        it('throws invariant error when created record is missing', async () => {
            const data = {
                tokenHash: 'token-hash-123',
                type: TokenType.REFRESH,
                expiresAt: new Date('2024-01-01T00:00:00Z'),
                userId: 4,
            };
            const { insert, values } = makeInsertChain(12);
            const { select, from, query } = makeSelectChain([]);

            await expect(repo.create(data)).rejects.toThrow('RepositoryInvariantViolation: created record not found');

            expect(insert).toHaveBeenCalledWith(tokens);
            expect(values).toHaveBeenCalledWith(data);
            expectSelectChain(select, from, tokens);
            expect(query.where).toHaveBeenCalledWith(eq(tokens.id, 12));
            expect(query.limit).toHaveBeenCalledWith(1);
        });
    });

    describe('delete', () => {
        it('executes delete query', async () => {
            const { deleteSpy, where } = makeDeleteChain();

            const result = await repo.delete(5);

            expect(deleteSpy).toHaveBeenCalledWith(tokens);
            expect(where).toHaveBeenCalledWith(eq(tokens.id, 5));
            expect(result).toBe(1);
        });
    });

    describe('markTokenRevoked', () => {
        it('updates revokedAt when token is not yet revoked', async () => {
            const revokedAt = new Date('2024-01-01T00:00:00Z');
            const { updateSpy, set, where } = makeUpdateChain(1);

            const result = await repo.markTokenRevoked(6, revokedAt);

            expect(updateSpy).toHaveBeenCalledWith(tokens);
            expect(set).toHaveBeenCalledWith({ revokedAt });
            expect(where).toHaveBeenCalledWith(and(eq(tokens.id, 6), isNull(tokens.revokedAt)));
            expect(result).toBe(1);
        });
    });

    describe('deleteByTokenHash', () => {
        it('executes delete by token query', async () => {
            const { deleteSpy, where } = makeDeleteChain();

            const result = await repo.deleteByTokenHash('token-hash-9');

            expect(deleteSpy).toHaveBeenCalledWith(tokens);
            expect(where).toHaveBeenCalledWith(and(eq(tokens.tokenHash, 'token-hash-9'), eq(tokens.type, TokenType.REFRESH)));
            expect(result).toBeUndefined();
        });
    });

    describe('deleteByTokenHashAndType', () => {
        it('executes delete by token hash and type query', async () => {
            const { deleteSpy, where } = makeDeleteChain();

            const result = await repo.deleteByTokenHashAndType('token-hash-10', TokenType.PASSWORD_RESET);

            expect(deleteSpy).toHaveBeenCalledWith(tokens);
            expect(where).toHaveBeenCalledWith(and(eq(tokens.tokenHash, 'token-hash-10'), eq(tokens.type, TokenType.PASSWORD_RESET)));
            expect(result).toBeUndefined();
        });
    });

    describe('deleteBySessionId', () => {
        it('executes delete by session id query', async () => {
            const { deleteSpy, where } = makeDeleteChain(2);

            const result = await repo.deleteBySessionId('session-id');

            expect(deleteSpy).toHaveBeenCalledWith(tokens);
            expect(where).toHaveBeenCalledWith(and(eq(tokens.sessionId, 'session-id'), eq(tokens.type, TokenType.REFRESH)));
            expect(result).toBe(2);
        });
    });

    describe('deleteByUserIdAndType', () => {
        it('executes delete by user id and type query', async () => {
            const { deleteSpy, where } = makeDeleteChain(3);

            const result = await repo.deleteByUserIdAndType(7, TokenType.REFRESH);

            expect(deleteSpy).toHaveBeenCalledWith(tokens);
            expect(where).toHaveBeenCalledWith(and(eq(tokens.userId, 7), eq(tokens.type, TokenType.REFRESH)));
            expect(result).toBe(3);
        });
    });
});



