import { and, asc, between, desc, eq, inArray } from 'drizzle-orm';
import { TransactionRepository } from '../../../src/repositories/transactionRepository';
import { db } from '../../../src/db';
import { transactions } from '../../../src/db/schema';
import { FilterOperator, SortOrder } from '../../../../shared/enums/operator.enums';
import { TransactionSource, TransactionType } from '../../../../shared/enums/transaction.enums';
import { makeDbTransaction } from '../../helpers/factories';

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

const makeUpdateChain = () => {
    const where = jest.fn().mockResolvedValue(undefined);
    const set = jest.fn().mockReturnValue({ where });
    const update = jest.spyOn(db, 'update').mockReturnValue({ set } as unknown as ReturnType<typeof db.update>);
    return { update, set, where };
};

const makeDeleteChain = () => {
    const where = jest.fn().mockResolvedValue(undefined);
    const deleteSpy = jest.spyOn(db, 'delete').mockReturnValue({ where } as unknown as ReturnType<typeof db.delete>);
    return { deleteSpy, where };
};

const expectSelectChain = (select: jest.SpyInstance, from: jest.Mock, table: unknown) => {
    expect(select).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith(table);
};

describe('TransactionRepository', () => {
    let repo: TransactionRepository;

    beforeEach(() => {
        repo = new TransactionRepository();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('findById', () => {
        it('returns transaction when found', async () => {
            const transaction = makeDbTransaction({ id: 1 });
            const { select, from, query } = makeSelectChain([transaction]);

            const result = await repo.findById(1);

            expectSelectChain(select, from, transactions);
            expect(query.where).toHaveBeenCalledWith(eq(transactions.id, 1));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(transaction);
        });

        it('returns null when not found', async () => {
            const { select, from, query } = makeSelectChain([]);

            const result = await repo.findById(99);

            expectSelectChain(select, from, transactions);
            expect(query.where).toHaveBeenCalledWith(eq(transactions.id, 99));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toBeNull();
        });
    });

    describe('findMany', () => {
        it('returns all transactions when no filters', async () => {
            const list = [makeDbTransaction({ id: 1 }), makeDbTransaction({ id: 2 })];
            const { select, from, query } = makeSelectChain(list);

            const result = await repo.findMany();

            expectSelectChain(select, from, transactions);
            expect(query.where).not.toHaveBeenCalled();
            expect(query.orderBy).not.toHaveBeenCalled();
            expect(query.limit).not.toHaveBeenCalled();
            expect(query.offset).not.toHaveBeenCalled();
            expect(result).toEqual(list);
        });

        it('applies accountId equal filter', async () => {
            const { select, from, query } = makeSelectChain([makeDbTransaction({ id: 1, accountId: 7 })]);

            await repo.findMany({ accountId: { operator: FilterOperator.EQ, value: 7 } });

            expectSelectChain(select, from, transactions);
            expect(query.where).toHaveBeenCalledWith(and(eq(transactions.accountId, 7)));
        });

        it('applies accountId in filter', async () => {
            const { select, from, query } = makeSelectChain([makeDbTransaction({ id: 1, accountId: 7 })]);

            await repo.findMany({ accountId: { operator: FilterOperator.IN, value: [7, 8] } });

            expectSelectChain(select, from, transactions);
            expect(query.where).toHaveBeenCalledWith(and(inArray(transactions.accountId, [7, 8])));
        });

        it('applies creditCardId equal filter', async () => {
            const { select, from, query } = makeSelectChain([makeDbTransaction({ id: 1, creditCardId: 5 })]);

            await repo.findMany({ creditCardId: { operator: FilterOperator.EQ, value: 5 } });

            expectSelectChain(select, from, transactions);
            expect(query.where).toHaveBeenCalledWith(and(eq(transactions.creditCardId, 5)));
        });

        it('applies creditCardId in filter', async () => {
            const { select, from, query } = makeSelectChain([makeDbTransaction({ id: 1, creditCardId: 5 })]);

            await repo.findMany({ creditCardId: { operator: FilterOperator.IN, value: [5, 6] } });

            expectSelectChain(select, from, transactions);
            expect(query.where).toHaveBeenCalledWith(and(inArray(transactions.creditCardId, [5, 6])));
        });

        it('applies categoryId equal filter', async () => {
            const { select, from, query } = makeSelectChain([makeDbTransaction({ id: 1, categoryId: 9 })]);

            await repo.findMany({ categoryId: { operator: FilterOperator.EQ, value: 9 } });

            expectSelectChain(select, from, transactions);
            expect(query.where).toHaveBeenCalledWith(and(eq(transactions.categoryId, 9)));
        });

        it('applies categoryId in filter', async () => {
            const { select, from, query } = makeSelectChain([makeDbTransaction({ id: 1, categoryId: 9 })]);

            await repo.findMany({ categoryId: { operator: FilterOperator.IN, value: [9, 10] } });

            expectSelectChain(select, from, transactions);
            expect(query.where).toHaveBeenCalledWith(and(inArray(transactions.categoryId, [9, 10])));
        });

        it('applies subcategoryId equal filter', async () => {
            const { select, from, query } = makeSelectChain([makeDbTransaction({ id: 1, subcategoryId: 11 })]);

            await repo.findMany({ subcategoryId: { operator: FilterOperator.EQ, value: 11 } });

            expectSelectChain(select, from, transactions);
            expect(query.where).toHaveBeenCalledWith(and(eq(transactions.subcategoryId, 11)));
        });

        it('applies subcategoryId in filter', async () => {
            const { select, from, query } = makeSelectChain([makeDbTransaction({ id: 1, subcategoryId: 11 })]);

            await repo.findMany({ subcategoryId: { operator: FilterOperator.IN, value: [11, 12] } });

            expectSelectChain(select, from, transactions);
            expect(query.where).toHaveBeenCalledWith(and(inArray(transactions.subcategoryId, [11, 12])));
        });

        it('applies active filter', async () => {
            const { select, from, query } = makeSelectChain([makeDbTransaction({ id: 1, active: false })]);

            await repo.findMany({ active: { operator: FilterOperator.EQ, value: false } });

            expectSelectChain(select, from, transactions);
            expect(query.where).toHaveBeenCalledWith(and(eq(transactions.active, false)));
        });

        it('applies date between filter', async () => {
            const { select, from, query } = makeSelectChain([makeDbTransaction({ id: 1 })]);
            const start = new Date('2024-01-01T00:00:00Z');
            const end = new Date('2024-01-31T00:00:00Z');

            await repo.findMany({ date: { operator: FilterOperator.BETWEEN, value: [start, end] } });

            expectSelectChain(select, from, transactions);
            expect(query.where).toHaveBeenCalledWith(and(between(transactions.date, start, end)));
        });

        it('applies combined filters', async () => {
            const { select, from, query } = makeSelectChain([makeDbTransaction({ id: 1 })]);
            const start = new Date('2024-01-01T00:00:00Z');
            const end = new Date('2024-01-31T00:00:00Z');

            await repo.findMany({
                accountId: { operator: FilterOperator.EQ, value: 2 },
                categoryId: { operator: FilterOperator.IN, value: [3, 4] },
                active: { operator: FilterOperator.EQ, value: true },
                date: { operator: FilterOperator.BETWEEN, value: [start, end] },
            });

            expectSelectChain(select, from, transactions);
            expect(query.where).toHaveBeenCalledWith(
                and(
                    eq(transactions.accountId, 2),
                    inArray(transactions.categoryId, [3, 4]),
                    eq(transactions.active, true),
                    between(transactions.date, start, end)
                )
            );
        });

        it('applies sorting asc', async () => {
            const { select, from, query } = makeSelectChain([makeDbTransaction({ id: 1 })]);

            await repo.findMany(undefined, { sort: 'date', order: SortOrder.ASC });

            expectSelectChain(select, from, transactions);
            expect(query.orderBy).toHaveBeenCalledWith(asc(transactions.date));
        });

        it('applies sorting desc', async () => {
            const { select, from, query } = makeSelectChain([makeDbTransaction({ id: 1 })]);

            await repo.findMany(undefined, { sort: 'date', order: SortOrder.DESC });

            expectSelectChain(select, from, transactions);
            expect(query.orderBy).toHaveBeenCalledWith(desc(transactions.date));
        });

        it('applies pagination', async () => {
            const { select, from, query } = makeSelectChain([makeDbTransaction({ id: 1 })]);

            await repo.findMany(undefined, { limit: 5, offset: 10 });

            expectSelectChain(select, from, transactions);
            expect(query.limit).toHaveBeenCalledWith(5);
            expect(query.offset).toHaveBeenCalledWith(10);
        });

        it('returns empty array when no results', async () => {
            const { select, from, query } = makeSelectChain([]);

            const result = await repo.findMany();

            expectSelectChain(select, from, transactions);
            expect(query.where).not.toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe('count', () => {
        it('returns count when no filters', async () => {
            const { select, from, query } = makeSelectChain([{}, {}, {}]);

            const result = await repo.count();

            expectSelectChain(select, from, transactions);
            expect(select).toHaveBeenCalledWith({ count: transactions.id });
            expect(query.where).not.toHaveBeenCalled();
            expect(result).toBe(3);
        });

        it('applies accountId equal filter to count', async () => {
            const { select, from, query } = makeSelectChain([{}, {}]);

            const result = await repo.count({ accountId: { operator: FilterOperator.EQ, value: 2 } });

            expectSelectChain(select, from, transactions);
            expect(select).toHaveBeenCalledWith({ count: transactions.id });
            expect(query.where).toHaveBeenCalledWith(and(eq(transactions.accountId, 2)));
            expect(result).toBe(2);
        });

        it('applies accountId in filter to count', async () => {
            const { select, from, query } = makeSelectChain([{}, {}, {}]);

            const result = await repo.count({ accountId: { operator: FilterOperator.IN, value: [2, 3, 4] } });

            expectSelectChain(select, from, transactions);
            expect(select).toHaveBeenCalledWith({ count: transactions.id });
            expect(query.where).toHaveBeenCalledWith(and(inArray(transactions.accountId, [2, 3, 4])));
            expect(result).toBe(3);
        });

        it('applies creditCardId equal filter to count', async () => {
            const { select, from, query } = makeSelectChain([{}]);

            const result = await repo.count({ creditCardId: { operator: FilterOperator.EQ, value: 5 } });

            expectSelectChain(select, from, transactions);
            expect(select).toHaveBeenCalledWith({ count: transactions.id });
            expect(query.where).toHaveBeenCalledWith(and(eq(transactions.creditCardId, 5)));
            expect(result).toBe(1);
        });

        it('applies creditCardId in filter to count', async () => {
            const { select, from, query } = makeSelectChain([{}, {}]);

            const result = await repo.count({ creditCardId: { operator: FilterOperator.IN, value: [5, 6] } });

            expectSelectChain(select, from, transactions);
            expect(select).toHaveBeenCalledWith({ count: transactions.id });
            expect(query.where).toHaveBeenCalledWith(and(inArray(transactions.creditCardId, [5, 6])));
            expect(result).toBe(2);
        });

        it('applies categoryId equal filter to count', async () => {
            const { select, from, query } = makeSelectChain([{}, {}, {}]);

            const result = await repo.count({ categoryId: { operator: FilterOperator.EQ, value: 9 } });

            expectSelectChain(select, from, transactions);
            expect(select).toHaveBeenCalledWith({ count: transactions.id });
            expect(query.where).toHaveBeenCalledWith(and(eq(transactions.categoryId, 9)));
            expect(result).toBe(3);
        });

        it('applies categoryId in filter to count', async () => {
            const { select, from, query } = makeSelectChain([{}, {}, {}]);

            const result = await repo.count({ categoryId: { operator: FilterOperator.IN, value: [9, 10, 11] } });

            expectSelectChain(select, from, transactions);
            expect(select).toHaveBeenCalledWith({ count: transactions.id });
            expect(query.where).toHaveBeenCalledWith(and(inArray(transactions.categoryId, [9, 10, 11])));
            expect(result).toBe(3);
        });

        it('applies subcategoryId equal filter to count', async () => {
            const { select, from, query } = makeSelectChain([{}]);

            const result = await repo.count({ subcategoryId: { operator: FilterOperator.EQ, value: 12 } });

            expectSelectChain(select, from, transactions);
            expect(select).toHaveBeenCalledWith({ count: transactions.id });
            expect(query.where).toHaveBeenCalledWith(and(eq(transactions.subcategoryId, 12)));
            expect(result).toBe(1);
        });

        it('applies subcategoryId in filter to count', async () => {
            const { select, from, query } = makeSelectChain([{}, {}]);

            const result = await repo.count({ subcategoryId: { operator: FilterOperator.IN, value: [12, 13] } });

            expectSelectChain(select, from, transactions);
            expect(select).toHaveBeenCalledWith({ count: transactions.id });
            expect(query.where).toHaveBeenCalledWith(and(inArray(transactions.subcategoryId, [12, 13])));
            expect(result).toBe(2);
        });

        it('applies active filter to count', async () => {
            const { select, from, query } = makeSelectChain([{}]);

            const result = await repo.count({ active: { operator: FilterOperator.EQ, value: false } });

            expectSelectChain(select, from, transactions);
            expect(select).toHaveBeenCalledWith({ count: transactions.id });
            expect(query.where).toHaveBeenCalledWith(and(eq(transactions.active, false)));
            expect(result).toBe(1);
        });

        it('returns 0 when no results', async () => {
            const { select, from } = makeSelectChain([]);

            const result = await repo.count();

            expectSelectChain(select, from, transactions);
            expect(select).toHaveBeenCalledWith({ count: transactions.id });
            expect(result).toBe(0);
        });
    });

    describe('create', () => {
        it('inserts and returns created transaction', async () => {
            const data = {
                value: '99.99',
                date: new Date('2024-01-01T00:00:00Z'),
                transactionType: TransactionType.EXPENSE,
                transactionSource: TransactionSource.ACCOUNT,
                accountId: 2,
                categoryId: 3,
                active: true,
            };
            const created = makeDbTransaction({ id: 10, accountId: 2, categoryId: 3 });
            const { insert, values } = makeInsertChain(10);
            const { select, from, query } = makeSelectChain([created]);

            const result = await repo.create(data);

            expect(insert).toHaveBeenCalledWith(transactions);
            expect(values).toHaveBeenCalledWith(data);
            expectSelectChain(select, from, transactions);
            expect(query.where).toHaveBeenCalledWith(eq(transactions.id, 10));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(created);
        });

        it('throws invariant error when created record is missing', async () => {
            const data = {
                value: '99.99',
                date: new Date('2024-01-01T00:00:00Z'),
                transactionType: TransactionType.EXPENSE,
                transactionSource: TransactionSource.ACCOUNT,
                accountId: 2,
                categoryId: 3,
                active: true,
            };
            const { insert, values } = makeInsertChain(12);
            const { select, from, query } = makeSelectChain([]);

            await expect(repo.create(data)).rejects.toThrow('RepositoryInvariantViolation: created record not found');

            expect(insert).toHaveBeenCalledWith(transactions);
            expect(values).toHaveBeenCalledWith(data);
            expectSelectChain(select, from, transactions);
            expect(query.where).toHaveBeenCalledWith(eq(transactions.id, 12));
            expect(query.limit).toHaveBeenCalledWith(1);
        });
    });

    describe('update', () => {
        it('updates and returns transaction', async () => {
            const updates = { observation: 'Updated' };
            const updated = makeDbTransaction({ id: 7, observation: 'Updated' });
            const { update, set, where } = makeUpdateChain();
            const { select, from, query } = makeSelectChain([updated]);

            const result = await repo.update(7, updates);

            expect(update).toHaveBeenCalledWith(transactions);
            expect(set).toHaveBeenCalledWith(updates);
            expect(where).toHaveBeenCalledWith(eq(transactions.id, 7));
            expectSelectChain(select, from, transactions);
            expect(query.where).toHaveBeenCalledWith(eq(transactions.id, 7));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(updated);
        });

        it('throws invariant error when updated record is missing', async () => {
            const updates = { observation: 'Updated' };
            const { update, set, where } = makeUpdateChain();
            const { select, from, query } = makeSelectChain([]);

            await expect(repo.update(7, updates)).rejects.toThrow('RepositoryInvariantViolation: updated record not found');

            expect(update).toHaveBeenCalledWith(transactions);
            expect(set).toHaveBeenCalledWith(updates);
            expect(where).toHaveBeenCalledWith(eq(transactions.id, 7));
            expectSelectChain(select, from, transactions);
            expect(query.where).toHaveBeenCalledWith(eq(transactions.id, 7));
            expect(query.limit).toHaveBeenCalledWith(1);
        });
    });

    describe('delete', () => {
        it('executes delete query', async () => {
            const { deleteSpy, where } = makeDeleteChain();

            const result = await repo.delete(5);

            expect(deleteSpy).toHaveBeenCalledWith(transactions);
            expect(where).toHaveBeenCalledWith(eq(transactions.id, 5));
            expect(result).toBeUndefined();
        });
    });
});




