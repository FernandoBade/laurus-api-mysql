import { and, asc, desc, eq } from 'drizzle-orm';
import { AccountRepository } from '../../../src/repositories/accountRepository';
import { db } from '../../../src/db';
import { accounts } from '../../../src/db/schema';
import { AccountType, Operator } from '../../../../shared/enums';
import { makeDbAccount } from '../../helpers/factories';

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

const makeUpdateChain = () => {
    const where = jest.fn().mockResolvedValue(undefined);
    const set = jest.fn().mockReturnValue({ where });
    const update = jest.spyOn(db, 'update').mockReturnValue({ set } as any);
    return { update, set, where };
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

describe('AccountRepository', () => {
    let repo: AccountRepository;

    beforeEach(() => {
        repo = new AccountRepository();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('findById', () => {
        it('returns account when found', async () => {
            const account = makeDbAccount({ id: 1 });
            const { select, from, query } = makeSelectChain([account]);

            const result = await repo.findById(1);

            expectSelectChain(select, from, accounts);
            expect(query.where).toHaveBeenCalledWith(eq(accounts.id, 1));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(account);
        });

        it('returns null when not found', async () => {
            const { select, from, query } = makeSelectChain([]);

            const result = await repo.findById(99);

            expectSelectChain(select, from, accounts);
            expect(query.where).toHaveBeenCalledWith(eq(accounts.id, 99));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toBeNull();
        });
    });

    describe('findMany', () => {
        it('returns all accounts when no filters', async () => {
            const accountsList = [makeDbAccount({ id: 1 }), makeDbAccount({ id: 2 })];
            const { select, from, query } = makeSelectChain(accountsList);

            const result = await repo.findMany();

            expectSelectChain(select, from, accounts);
            expect(query.where).not.toHaveBeenCalled();
            expect(query.orderBy).not.toHaveBeenCalled();
            expect(query.limit).not.toHaveBeenCalled();
            expect(query.offset).not.toHaveBeenCalled();
            expect(result).toEqual(accountsList);
        });

        it('applies userId filter', async () => {
            const { select, from, query } = makeSelectChain([makeDbAccount({ id: 1, userId: 7 })]);

            await repo.findMany({ userId: { operator: Operator.EQUAL, value: 7 } });

            expectSelectChain(select, from, accounts);
            expect(query.where).toHaveBeenCalledWith(and(eq(accounts.userId, 7)));
        });

        it('applies active filter', async () => {
            const { select, from, query } = makeSelectChain([makeDbAccount({ id: 1, active: false })]);

            await repo.findMany({ active: { operator: Operator.EQUAL, value: false } });

            expectSelectChain(select, from, accounts);
            expect(query.where).toHaveBeenCalledWith(and(eq(accounts.active, false)));
        });

        it('applies combined filters', async () => {
            const { select, from, query } = makeSelectChain([makeDbAccount({ id: 1, userId: 3, active: true })]);

            await repo.findMany({
                userId: { operator: Operator.EQUAL, value: 3 },
                active: { operator: Operator.EQUAL, value: true },
            });

            expectSelectChain(select, from, accounts);
            expect(query.where).toHaveBeenCalledWith(and(eq(accounts.userId, 3), eq(accounts.active, true)));
        });

        it('applies sorting asc', async () => {
            const { select, from, query } = makeSelectChain([makeDbAccount({ id: 1 })]);

            await repo.findMany(undefined, { sort: 'name', order: 'asc' });

            expectSelectChain(select, from, accounts);
            expect(query.orderBy).toHaveBeenCalledWith(asc(accounts.name));
        });

        it('applies sorting desc', async () => {
            const { select, from, query } = makeSelectChain([makeDbAccount({ id: 1 })]);

            await repo.findMany(undefined, { sort: 'name', order: 'desc' });

            expectSelectChain(select, from, accounts);
            expect(query.orderBy).toHaveBeenCalledWith(desc(accounts.name));
        });

        it('applies pagination', async () => {
            const { select, from, query } = makeSelectChain([makeDbAccount({ id: 1 })]);

            await repo.findMany(undefined, { limit: 5, offset: 10 });

            expectSelectChain(select, from, accounts);
            expect(query.limit).toHaveBeenCalledWith(5);
            expect(query.offset).toHaveBeenCalledWith(10);
        });

        it('returns empty array when no results', async () => {
            const { select, from, query } = makeSelectChain([]);

            const result = await repo.findMany();

            expectSelectChain(select, from, accounts);
            expect(query.where).not.toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe('count', () => {
        it('returns count when no filters', async () => {
            const { select, from, query } = makeSelectChain([{}, {}, {}]);

            const result = await repo.count();

            expectSelectChain(select, from, accounts);
            expect(select).toHaveBeenCalledWith({ count: accounts.id });
            expect(query.where).not.toHaveBeenCalled();
            expect(result).toBe(3);
        });

        it('applies filters to count', async () => {
            const { select, from, query } = makeSelectChain([{}, {}]);

            const result = await repo.count({ userId: { operator: Operator.EQUAL, value: 2 } });

            expectSelectChain(select, from, accounts);
            expect(select).toHaveBeenCalledWith({ count: accounts.id });
            expect(query.where).toHaveBeenCalledWith(and(eq(accounts.userId, 2)));
            expect(result).toBe(2);
        });

        it('returns 0 when no results', async () => {
            const { select, from } = makeSelectChain([]);

            const result = await repo.count();

            expectSelectChain(select, from, accounts);
            expect(select).toHaveBeenCalledWith({ count: accounts.id });
            expect(result).toBe(0);
        });
    });

    describe('create', () => {
        it('inserts and returns created account', async () => {
            const data = {
                name: 'Wallet',
                institution: 'Sample Bank',
                type: AccountType.CHECKING,
                observation: null,
                userId: 4,
                active: true,
            };
            const created = makeDbAccount({ id: 10, userId: 4, name: data.name });
            const { insert, values } = makeInsertChain(10);
            const { select, from, query } = makeSelectChain([created]);

            const result = await repo.create(data);

            expect(insert).toHaveBeenCalledWith(accounts);
            expect(values).toHaveBeenCalledWith(data);
            expectSelectChain(select, from, accounts);
            expect(query.where).toHaveBeenCalledWith(eq(accounts.id, 10));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(created);
        });

        it('throws invariant error when created record is missing', async () => {
            const data = {
                name: 'Wallet',
                institution: 'Sample Bank',
                type: AccountType.CHECKING,
                observation: null,
                userId: 4,
                active: true,
            };
            const { insert, values } = makeInsertChain(12);
            const { select, from, query } = makeSelectChain([]);

            await expect(repo.create(data)).rejects.toThrow('RepositoryInvariantViolation: created record not found');

            expect(insert).toHaveBeenCalledWith(accounts);
            expect(values).toHaveBeenCalledWith(data);
            expectSelectChain(select, from, accounts);
            expect(query.where).toHaveBeenCalledWith(eq(accounts.id, 12));
            expect(query.limit).toHaveBeenCalledWith(1);
        });
    });

    describe('update', () => {
        it('updates and returns account', async () => {
            const updates = { name: 'Updated' };
            const updated = makeDbAccount({ id: 7, name: 'Updated' });
            const { update, set, where } = makeUpdateChain();
            const { select, from, query } = makeSelectChain([updated]);

            const result = await repo.update(7, updates);

            expect(update).toHaveBeenCalledWith(accounts);
            expect(set).toHaveBeenCalledWith(updates);
            expect(where).toHaveBeenCalledWith(eq(accounts.id, 7));
            expectSelectChain(select, from, accounts);
            expect(query.where).toHaveBeenCalledWith(eq(accounts.id, 7));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(updated);
        });

        it('throws invariant error when updated record is missing', async () => {
            const updates = { name: 'Updated' };
            const { update, set, where } = makeUpdateChain();
            const { select, from, query } = makeSelectChain([]);

            await expect(repo.update(7, updates)).rejects.toThrow('RepositoryInvariantViolation: updated record not found');

            expect(update).toHaveBeenCalledWith(accounts);
            expect(set).toHaveBeenCalledWith(updates);
            expect(where).toHaveBeenCalledWith(eq(accounts.id, 7));
            expectSelectChain(select, from, accounts);
            expect(query.where).toHaveBeenCalledWith(eq(accounts.id, 7));
            expect(query.limit).toHaveBeenCalledWith(1);
        });
    });

    describe('delete', () => {
        it('executes delete query', async () => {
            const { deleteSpy, where } = makeDeleteChain();

            const result = await repo.delete(5);

            expect(deleteSpy).toHaveBeenCalledWith(accounts);
            expect(where).toHaveBeenCalledWith(eq(accounts.id, 5));
            expect(result).toBeUndefined();
        });
    });
});



