import { and, asc, desc, eq } from 'drizzle-orm';
import { CreditCardRepository } from '../../../src/repositories/creditCardRepository';
import { db } from '../../../src/db';
import { creditCards, SelectCreditCard } from '../../../src/db/schema';
import { CreditCardFlag, Operator } from '../../../src/utils/enum';

const makeCreditCard = (overrides: Partial<SelectCreditCard> = {}): SelectCreditCard => {
    const now = new Date('2024-01-01T00:00:00Z');
    return {
        id: overrides.id ?? 1,
        name: overrides.name ?? 'Main Card',
        flag: overrides.flag ?? CreditCardFlag.VISA,
        observation: overrides.observation ?? null,
        active: overrides.active ?? true,
        userId: overrides.userId ?? 1,
        accountId: overrides.accountId ?? 1,
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

describe('CreditCardRepository', () => {
    let repo: CreditCardRepository;

    beforeEach(() => {
        repo = new CreditCardRepository();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('findById', () => {
        it('returns credit card when found', async () => {
            const card = makeCreditCard({ id: 1 });
            const { select, from, query } = makeSelectChain([card]);

            const result = await repo.findById(1);

            expectSelectChain(select, from, creditCards);
            expect(query.where).toHaveBeenCalledWith(eq(creditCards.id, 1));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(card);
        });

        it('returns null when not found', async () => {
            const { select, from, query } = makeSelectChain([]);

            const result = await repo.findById(99);

            expectSelectChain(select, from, creditCards);
            expect(query.where).toHaveBeenCalledWith(eq(creditCards.id, 99));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toBeNull();
        });
    });

    describe('findMany', () => {
        it('returns all credit cards when no filters', async () => {
            const list = [makeCreditCard({ id: 1 }), makeCreditCard({ id: 2 })];
            const { select, from, query } = makeSelectChain(list);

            const result = await repo.findMany();

            expectSelectChain(select, from, creditCards);
            expect(query.where).not.toHaveBeenCalled();
            expect(query.orderBy).not.toHaveBeenCalled();
            expect(query.limit).not.toHaveBeenCalled();
            expect(query.offset).not.toHaveBeenCalled();
            expect(result).toEqual(list);
        });

        it('applies userId filter', async () => {
            const { select, from, query } = makeSelectChain([makeCreditCard({ id: 1, userId: 7 })]);

            await repo.findMany({ userId: { operator: Operator.EQUAL, value: 7 } });

            expectSelectChain(select, from, creditCards);
            expect(query.where).toHaveBeenCalledWith(and(eq(creditCards.userId, 7)));
        });

        it('applies accountId filter', async () => {
            const { select, from, query } = makeSelectChain([makeCreditCard({ id: 1, accountId: 3 })]);

            await repo.findMany({ accountId: { operator: Operator.EQUAL, value: 3 } });

            expectSelectChain(select, from, creditCards);
            expect(query.where).toHaveBeenCalledWith(and(eq(creditCards.accountId, 3)));
        });

        it('applies active filter', async () => {
            const { select, from, query } = makeSelectChain([makeCreditCard({ id: 1, active: false })]);

            await repo.findMany({ active: { operator: Operator.EQUAL, value: false } });

            expectSelectChain(select, from, creditCards);
            expect(query.where).toHaveBeenCalledWith(and(eq(creditCards.active, false)));
        });

        it('applies combined filters', async () => {
            const { select, from, query } = makeSelectChain([makeCreditCard({ id: 1, userId: 3, accountId: 4, active: true })]);

            await repo.findMany({
                userId: { operator: Operator.EQUAL, value: 3 },
                accountId: { operator: Operator.EQUAL, value: 4 },
                active: { operator: Operator.EQUAL, value: true },
            });

            expectSelectChain(select, from, creditCards);
            expect(query.where).toHaveBeenCalledWith(
                and(eq(creditCards.userId, 3), eq(creditCards.accountId, 4), eq(creditCards.active, true))
            );
        });

        it('applies sorting asc', async () => {
            const { select, from, query } = makeSelectChain([makeCreditCard({ id: 1 })]);

            await repo.findMany(undefined, { sort: 'name', order: 'asc' });

            expectSelectChain(select, from, creditCards);
            expect(query.orderBy).toHaveBeenCalledWith(asc(creditCards.name));
        });

        it('applies sorting desc', async () => {
            const { select, from, query } = makeSelectChain([makeCreditCard({ id: 1 })]);

            await repo.findMany(undefined, { sort: 'name', order: 'desc' });

            expectSelectChain(select, from, creditCards);
            expect(query.orderBy).toHaveBeenCalledWith(desc(creditCards.name));
        });

        it('applies pagination', async () => {
            const { select, from, query } = makeSelectChain([makeCreditCard({ id: 1 })]);

            await repo.findMany(undefined, { limit: 5, offset: 10 });

            expectSelectChain(select, from, creditCards);
            expect(query.limit).toHaveBeenCalledWith(5);
            expect(query.offset).toHaveBeenCalledWith(10);
        });

        it('returns empty array when no results', async () => {
            const { select, from, query } = makeSelectChain([]);

            const result = await repo.findMany();

            expectSelectChain(select, from, creditCards);
            expect(query.where).not.toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe('count', () => {
        it('returns count when no filters', async () => {
            const { select, from, query } = makeSelectChain([{}, {}, {}]);

            const result = await repo.count();

            expectSelectChain(select, from, creditCards);
            expect(select).toHaveBeenCalledWith({ count: creditCards.id });
            expect(query.where).not.toHaveBeenCalled();
            expect(result).toBe(3);
        });

        it('applies filters to count', async () => {
            const { select, from, query } = makeSelectChain([{}, {}]);

            const result = await repo.count({ userId: { operator: Operator.EQUAL, value: 2 } });

            expectSelectChain(select, from, creditCards);
            expect(select).toHaveBeenCalledWith({ count: creditCards.id });
            expect(query.where).toHaveBeenCalledWith(and(eq(creditCards.userId, 2)));
            expect(result).toBe(2);
        });

        it('returns 0 when no results', async () => {
            const { select, from } = makeSelectChain([]);

            const result = await repo.count();

            expectSelectChain(select, from, creditCards);
            expect(select).toHaveBeenCalledWith({ count: creditCards.id });
            expect(result).toBe(0);
        });
    });

    describe('create', () => {
        it('inserts and returns created credit card', async () => {
            const data = {
                name: 'Main Card',
                flag: CreditCardFlag.VISA,
                observation: null,
                userId: 4,
                accountId: 2,
                active: true,
            };
            const created = makeCreditCard({ id: 10, userId: 4, name: data.name });
            const { insert, values } = makeInsertChain(10);
            const { select, from, query } = makeSelectChain([created]);

            const result = await repo.create(data);

            expect(insert).toHaveBeenCalledWith(creditCards);
            expect(values).toHaveBeenCalledWith(data);
            expectSelectChain(select, from, creditCards);
            expect(query.where).toHaveBeenCalledWith(eq(creditCards.id, 10));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(created);
        });

        it('throws invariant error when created record is missing', async () => {
            const data = {
                name: 'Main Card',
                flag: CreditCardFlag.VISA,
                observation: null,
                userId: 4,
                accountId: 2,
                active: true,
            };
            const { insert, values } = makeInsertChain(12);
            const { select, from, query } = makeSelectChain([]);

            await expect(repo.create(data)).rejects.toThrow('RepositoryInvariantViolation: created record not found');

            expect(insert).toHaveBeenCalledWith(creditCards);
            expect(values).toHaveBeenCalledWith(data);
            expectSelectChain(select, from, creditCards);
            expect(query.where).toHaveBeenCalledWith(eq(creditCards.id, 12));
            expect(query.limit).toHaveBeenCalledWith(1);
        });
    });

    describe('update', () => {
        it('updates and returns credit card', async () => {
            const updates = { name: 'Updated' };
            const updated = makeCreditCard({ id: 7, name: 'Updated' });
            const { update, set, where } = makeUpdateChain();
            const { select, from, query } = makeSelectChain([updated]);

            const result = await repo.update(7, updates);

            expect(update).toHaveBeenCalledWith(creditCards);
            expect(set).toHaveBeenCalledWith(updates);
            expect(where).toHaveBeenCalledWith(eq(creditCards.id, 7));
            expectSelectChain(select, from, creditCards);
            expect(query.where).toHaveBeenCalledWith(eq(creditCards.id, 7));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(updated);
        });

        it('throws invariant error when updated record is missing', async () => {
            const updates = { name: 'Updated' };
            const { update, set, where } = makeUpdateChain();
            const { select, from, query } = makeSelectChain([]);

            await expect(repo.update(7, updates)).rejects.toThrow('RepositoryInvariantViolation: updated record not found');

            expect(update).toHaveBeenCalledWith(creditCards);
            expect(set).toHaveBeenCalledWith(updates);
            expect(where).toHaveBeenCalledWith(eq(creditCards.id, 7));
            expectSelectChain(select, from, creditCards);
            expect(query.where).toHaveBeenCalledWith(eq(creditCards.id, 7));
            expect(query.limit).toHaveBeenCalledWith(1);
        });
    });

    describe('delete', () => {
        it('executes delete query', async () => {
            const { deleteSpy, where } = makeDeleteChain();

            const result = await repo.delete(5);

            expect(deleteSpy).toHaveBeenCalledWith(creditCards);
            expect(where).toHaveBeenCalledWith(eq(creditCards.id, 5));
            expect(result).toBeUndefined();
        });
    });
});
