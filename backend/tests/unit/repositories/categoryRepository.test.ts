import { and, asc, desc, eq } from 'drizzle-orm';
import { CategoryRepository } from '../../../src/repositories/categoryRepository';
import { db } from '../../../src/db';
import { categories, SelectCategory } from '../../../src/db/schema';
import { CategoryColor, CategoryType, Operator } from '../../../../shared/enums';

const makeCategory = (overrides: Partial<SelectCategory> = {}): SelectCategory => {
    const now = new Date('2024-01-01T00:00:00Z');
    return {
        id: overrides.id ?? 1,
        name: overrides.name ?? 'Food',
        type: overrides.type ?? CategoryType.EXPENSE,
        color: overrides.color ?? CategoryColor.RED,
        active: overrides.active ?? true,
        userId: overrides.userId ?? 1,
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

describe('CategoryRepository', () => {
    let repo: CategoryRepository;

    beforeEach(() => {
        repo = new CategoryRepository();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('findById', () => {
        it('returns category when found', async () => {
            const category = makeCategory({ id: 1 });
            const { select, from, query } = makeSelectChain([category]);

            const result = await repo.findById(1);

            expectSelectChain(select, from, categories);
            expect(query.where).toHaveBeenCalledWith(eq(categories.id, 1));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(category);
        });

        it('returns null when not found', async () => {
            const { select, from, query } = makeSelectChain([]);

            const result = await repo.findById(99);

            expectSelectChain(select, from, categories);
            expect(query.where).toHaveBeenCalledWith(eq(categories.id, 99));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toBeNull();
        });
    });

    describe('findMany', () => {
        it('returns all categories when no filters', async () => {
            const list = [makeCategory({ id: 1 }), makeCategory({ id: 2 })];
            const { select, from, query } = makeSelectChain(list);

            const result = await repo.findMany();

            expectSelectChain(select, from, categories);
            expect(query.where).not.toHaveBeenCalled();
            expect(query.orderBy).not.toHaveBeenCalled();
            expect(query.limit).not.toHaveBeenCalled();
            expect(query.offset).not.toHaveBeenCalled();
            expect(result).toEqual(list);
        });

        it('applies userId filter', async () => {
            const { select, from, query } = makeSelectChain([makeCategory({ id: 1, userId: 7 })]);

            await repo.findMany({ userId: { operator: Operator.EQUAL, value: 7 } });

            expectSelectChain(select, from, categories);
            expect(query.where).toHaveBeenCalledWith(and(eq(categories.userId, 7)));
        });

        it('applies active filter', async () => {
            const { select, from, query } = makeSelectChain([makeCategory({ id: 1, active: false })]);

            await repo.findMany({ active: { operator: Operator.EQUAL, value: false } });

            expectSelectChain(select, from, categories);
            expect(query.where).toHaveBeenCalledWith(and(eq(categories.active, false)));
        });

        it('applies combined filters', async () => {
            const { select, from, query } = makeSelectChain([makeCategory({ id: 1, userId: 3, active: true })]);

            await repo.findMany({
                userId: { operator: Operator.EQUAL, value: 3 },
                active: { operator: Operator.EQUAL, value: true },
            });

            expectSelectChain(select, from, categories);
            expect(query.where).toHaveBeenCalledWith(and(eq(categories.userId, 3), eq(categories.active, true)));
        });

        it('applies sorting asc', async () => {
            const { select, from, query } = makeSelectChain([makeCategory({ id: 1 })]);

            await repo.findMany(undefined, { sort: 'name', order: 'asc' });

            expectSelectChain(select, from, categories);
            expect(query.orderBy).toHaveBeenCalledWith(asc(categories.name));
        });

        it('applies sorting desc', async () => {
            const { select, from, query } = makeSelectChain([makeCategory({ id: 1 })]);

            await repo.findMany(undefined, { sort: 'name', order: 'desc' });

            expectSelectChain(select, from, categories);
            expect(query.orderBy).toHaveBeenCalledWith(desc(categories.name));
        });

        it('applies pagination', async () => {
            const { select, from, query } = makeSelectChain([makeCategory({ id: 1 })]);

            await repo.findMany(undefined, { limit: 5, offset: 10 });

            expectSelectChain(select, from, categories);
            expect(query.limit).toHaveBeenCalledWith(5);
            expect(query.offset).toHaveBeenCalledWith(10);
        });

        it('returns empty array when no results', async () => {
            const { select, from, query } = makeSelectChain([]);

            const result = await repo.findMany();

            expectSelectChain(select, from, categories);
            expect(query.where).not.toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe('count', () => {
        it('returns count when no filters', async () => {
            const { select, from, query } = makeSelectChain([{}, {}, {}]);

            const result = await repo.count();

            expectSelectChain(select, from, categories);
            expect(select).toHaveBeenCalledWith({ count: categories.id });
            expect(query.where).not.toHaveBeenCalled();
            expect(result).toBe(3);
        });

        it('applies filters to count', async () => {
            const { select, from, query } = makeSelectChain([{}, {}]);

            const result = await repo.count({ userId: { operator: Operator.EQUAL, value: 2 } });

            expectSelectChain(select, from, categories);
            expect(select).toHaveBeenCalledWith({ count: categories.id });
            expect(query.where).toHaveBeenCalledWith(and(eq(categories.userId, 2)));
            expect(result).toBe(2);
        });

        it('returns 0 when no results', async () => {
            const { select, from } = makeSelectChain([]);

            const result = await repo.count();

            expectSelectChain(select, from, categories);
            expect(select).toHaveBeenCalledWith({ count: categories.id });
            expect(result).toBe(0);
        });
    });

    describe('create', () => {
        it('inserts and returns created category', async () => {
            const data = {
                name: 'Food',
                type: CategoryType.EXPENSE,
                color: CategoryColor.BLUE,
                userId: 4,
                active: true,
            };
            const created = makeCategory({ id: 10, userId: 4, name: data.name });
            const { insert, values } = makeInsertChain(10);
            const { select, from, query } = makeSelectChain([created]);

            const result = await repo.create(data);

            expect(insert).toHaveBeenCalledWith(categories);
            expect(values).toHaveBeenCalledWith(data);
            expectSelectChain(select, from, categories);
            expect(query.where).toHaveBeenCalledWith(eq(categories.id, 10));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(created);
        });

        it('throws invariant error when created record is missing', async () => {
            const data = {
                name: 'Food',
                type: CategoryType.EXPENSE,
                color: CategoryColor.BLUE,
                userId: 4,
                active: true,
            };
            const { insert, values } = makeInsertChain(12);
            const { select, from, query } = makeSelectChain([]);

            await expect(repo.create(data)).rejects.toThrow('RepositoryInvariantViolation: created record not found');

            expect(insert).toHaveBeenCalledWith(categories);
            expect(values).toHaveBeenCalledWith(data);
            expectSelectChain(select, from, categories);
            expect(query.where).toHaveBeenCalledWith(eq(categories.id, 12));
            expect(query.limit).toHaveBeenCalledWith(1);
        });
    });

    describe('update', () => {
        it('updates and returns category', async () => {
            const updates = { name: 'Updated' };
            const updated = makeCategory({ id: 7, name: 'Updated' });
            const { update, set, where } = makeUpdateChain();
            const { select, from, query } = makeSelectChain([updated]);

            const result = await repo.update(7, updates);

            expect(update).toHaveBeenCalledWith(categories);
            expect(set).toHaveBeenCalledWith(updates);
            expect(where).toHaveBeenCalledWith(eq(categories.id, 7));
            expectSelectChain(select, from, categories);
            expect(query.where).toHaveBeenCalledWith(eq(categories.id, 7));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(updated);
        });

        it('throws invariant error when updated record is missing', async () => {
            const updates = { name: 'Updated' };
            const { update, set, where } = makeUpdateChain();
            const { select, from, query } = makeSelectChain([]);

            await expect(repo.update(7, updates)).rejects.toThrow('RepositoryInvariantViolation: updated record not found');

            expect(update).toHaveBeenCalledWith(categories);
            expect(set).toHaveBeenCalledWith(updates);
            expect(where).toHaveBeenCalledWith(eq(categories.id, 7));
            expectSelectChain(select, from, categories);
            expect(query.where).toHaveBeenCalledWith(eq(categories.id, 7));
            expect(query.limit).toHaveBeenCalledWith(1);
        });
    });

    describe('delete', () => {
        it('executes delete query', async () => {
            const { deleteSpy, where } = makeDeleteChain();

            const result = await repo.delete(5);

            expect(deleteSpy).toHaveBeenCalledWith(categories);
            expect(where).toHaveBeenCalledWith(eq(categories.id, 5));
            expect(result).toBeUndefined();
        });
    });
});



