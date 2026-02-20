import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import { SubcategoryRepository } from '../../../src/repositories/subcategoryRepository';
import { db } from '../../../src/db';
import { subcategories, SelectSubcategory } from '../../../src/db/schema';
import { FilterOperator, SortOrder } from '../../../../shared/enums/operator.enums';

const makeSubcategory = (overrides: Partial<SelectSubcategory> = {}): SelectSubcategory => {
    const now = new Date('2024-01-01T00:00:00Z');
    return {
        id: overrides.id ?? 1,
        name: overrides.name ?? 'Sub',
        active: overrides.active ?? true,
        categoryId: overrides.categoryId ?? 1,
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

describe('SubcategoryRepository', () => {
    let repo: SubcategoryRepository;

    beforeEach(() => {
        repo = new SubcategoryRepository();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('findById', () => {
        it('returns subcategory when found', async () => {
            const item = makeSubcategory({ id: 1 });
            const { select, from, query } = makeSelectChain([item]);

            const result = await repo.findById(1);

            expectSelectChain(select, from, subcategories);
            expect(query.where).toHaveBeenCalledWith(eq(subcategories.id, 1));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(item);
        });

        it('returns null when not found', async () => {
            const { select, from, query } = makeSelectChain([]);

            const result = await repo.findById(99);

            expectSelectChain(select, from, subcategories);
            expect(query.where).toHaveBeenCalledWith(eq(subcategories.id, 99));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toBeNull();
        });
    });

    describe('findMany', () => {
        it('returns all subcategories when no filters', async () => {
            const list = [makeSubcategory({ id: 1 }), makeSubcategory({ id: 2 })];
            const { select, from, query } = makeSelectChain(list);

            const result = await repo.findMany();

            expectSelectChain(select, from, subcategories);
            expect(query.where).not.toHaveBeenCalled();
            expect(query.orderBy).not.toHaveBeenCalled();
            expect(query.limit).not.toHaveBeenCalled();
            expect(query.offset).not.toHaveBeenCalled();
            expect(result).toEqual(list);
        });

        it('applies categoryId equal filter', async () => {
            const { select, from, query } = makeSelectChain([makeSubcategory({ id: 1, categoryId: 7 })]);

            await repo.findMany({ categoryId: { operator: FilterOperator.EQ, value: 7 } });

            expectSelectChain(select, from, subcategories);
            expect(query.where).toHaveBeenCalledWith(and(eq(subcategories.categoryId, 7)));
        });

        it('applies categoryId in filter', async () => {
            const { select, from, query } = makeSelectChain([makeSubcategory({ id: 1, categoryId: 7 })]);

            await repo.findMany({ categoryId: { operator: FilterOperator.IN, value: [7, 8] } });

            expectSelectChain(select, from, subcategories);
            expect(query.where).toHaveBeenCalledWith(and(inArray(subcategories.categoryId, [7, 8])));
        });

        it('applies active filter', async () => {
            const { select, from, query } = makeSelectChain([makeSubcategory({ id: 1, active: false })]);

            await repo.findMany({ active: { operator: FilterOperator.EQ, value: false } });

            expectSelectChain(select, from, subcategories);
            expect(query.where).toHaveBeenCalledWith(and(eq(subcategories.active, false)));
        });

        it('applies combined filters', async () => {
            const { select, from, query } = makeSelectChain([makeSubcategory({ id: 1, categoryId: 3, active: true })]);

            await repo.findMany({
                categoryId: { operator: FilterOperator.EQ, value: 3 },
                active: { operator: FilterOperator.EQ, value: true },
            });

            expectSelectChain(select, from, subcategories);
            expect(query.where).toHaveBeenCalledWith(and(eq(subcategories.categoryId, 3), eq(subcategories.active, true)));
        });

        it('applies sorting asc', async () => {
            const { select, from, query } = makeSelectChain([makeSubcategory({ id: 1 })]);

            await repo.findMany(undefined, { sort: 'name', order: SortOrder.ASC });

            expectSelectChain(select, from, subcategories);
            expect(query.orderBy).toHaveBeenCalledWith(asc(subcategories.name));
        });

        it('applies sorting desc', async () => {
            const { select, from, query } = makeSelectChain([makeSubcategory({ id: 1 })]);

            await repo.findMany(undefined, { sort: 'name', order: SortOrder.DESC });

            expectSelectChain(select, from, subcategories);
            expect(query.orderBy).toHaveBeenCalledWith(desc(subcategories.name));
        });

        it('applies pagination', async () => {
            const { select, from, query } = makeSelectChain([makeSubcategory({ id: 1 })]);

            await repo.findMany(undefined, { limit: 5, offset: 10 });

            expectSelectChain(select, from, subcategories);
            expect(query.limit).toHaveBeenCalledWith(5);
            expect(query.offset).toHaveBeenCalledWith(10);
        });

        it('returns empty array when no results', async () => {
            const { select, from, query } = makeSelectChain([]);

            const result = await repo.findMany();

            expectSelectChain(select, from, subcategories);
            expect(query.where).not.toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe('count', () => {
        it('returns count when no filters', async () => {
            const { select, from, query } = makeSelectChain([{}, {}, {}]);

            const result = await repo.count();

            expectSelectChain(select, from, subcategories);
            expect(select).toHaveBeenCalledWith({ count: subcategories.id });
            expect(query.where).not.toHaveBeenCalled();
            expect(result).toBe(3);
        });

        it('applies categoryId equal filter to count', async () => {
            const { select, from, query } = makeSelectChain([{}, {}]);

            const result = await repo.count({ categoryId: { operator: FilterOperator.EQ, value: 2 } });

            expectSelectChain(select, from, subcategories);
            expect(select).toHaveBeenCalledWith({ count: subcategories.id });
            expect(query.where).toHaveBeenCalledWith(and(eq(subcategories.categoryId, 2)));
            expect(result).toBe(2);
        });

        it('applies categoryId in filter to count', async () => {
            const { select, from, query } = makeSelectChain([{}, {}, {}]);

            const result = await repo.count({ categoryId: { operator: FilterOperator.IN, value: [2, 3, 4] } });

            expectSelectChain(select, from, subcategories);
            expect(select).toHaveBeenCalledWith({ count: subcategories.id });
            expect(query.where).toHaveBeenCalledWith(and(inArray(subcategories.categoryId, [2, 3, 4])));
            expect(result).toBe(3);
        });

        it('applies active filter to count', async () => {
            const { select, from, query } = makeSelectChain([{}]);

            const result = await repo.count({ active: { operator: FilterOperator.EQ, value: false } });

            expectSelectChain(select, from, subcategories);
            expect(select).toHaveBeenCalledWith({ count: subcategories.id });
            expect(query.where).toHaveBeenCalledWith(and(eq(subcategories.active, false)));
            expect(result).toBe(1);
        });

        it('returns 0 when no results', async () => {
            const { select, from } = makeSelectChain([]);

            const result = await repo.count();

            expectSelectChain(select, from, subcategories);
            expect(select).toHaveBeenCalledWith({ count: subcategories.id });
            expect(result).toBe(0);
        });
    });

    describe('create', () => {
        it('inserts and returns created subcategory', async () => {
            const data = {
                name: 'Sub',
                categoryId: 4,
                active: true,
            };
            const created = makeSubcategory({ id: 10, categoryId: 4, name: data.name });
            const { insert, values } = makeInsertChain(10);
            const { select, from, query } = makeSelectChain([created]);

            const result = await repo.create(data);

            expect(insert).toHaveBeenCalledWith(subcategories);
            expect(values).toHaveBeenCalledWith(data);
            expectSelectChain(select, from, subcategories);
            expect(query.where).toHaveBeenCalledWith(eq(subcategories.id, 10));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(created);
        });

        it('throws invariant error when created record is missing', async () => {
            const data = {
                name: 'Sub',
                categoryId: 4,
                active: true,
            };
            const { insert, values } = makeInsertChain(12);
            const { select, from, query } = makeSelectChain([]);

            await expect(repo.create(data)).rejects.toThrow('RepositoryInvariantViolation: created record not found');

            expect(insert).toHaveBeenCalledWith(subcategories);
            expect(values).toHaveBeenCalledWith(data);
            expectSelectChain(select, from, subcategories);
            expect(query.where).toHaveBeenCalledWith(eq(subcategories.id, 12));
            expect(query.limit).toHaveBeenCalledWith(1);
        });
    });

    describe('update', () => {
        it('updates and returns subcategory', async () => {
            const updates = { name: 'Updated' };
            const updated = makeSubcategory({ id: 7, name: 'Updated' });
            const { update, set, where } = makeUpdateChain();
            const { select, from, query } = makeSelectChain([updated]);

            const result = await repo.update(7, updates);

            expect(update).toHaveBeenCalledWith(subcategories);
            expect(set).toHaveBeenCalledWith(updates);
            expect(where).toHaveBeenCalledWith(eq(subcategories.id, 7));
            expectSelectChain(select, from, subcategories);
            expect(query.where).toHaveBeenCalledWith(eq(subcategories.id, 7));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(updated);
        });

        it('throws invariant error when updated record is missing', async () => {
            const updates = { name: 'Updated' };
            const { update, set, where } = makeUpdateChain();
            const { select, from, query } = makeSelectChain([]);

            await expect(repo.update(7, updates)).rejects.toThrow('RepositoryInvariantViolation: updated record not found');

            expect(update).toHaveBeenCalledWith(subcategories);
            expect(set).toHaveBeenCalledWith(updates);
            expect(where).toHaveBeenCalledWith(eq(subcategories.id, 7));
            expectSelectChain(select, from, subcategories);
            expect(query.where).toHaveBeenCalledWith(eq(subcategories.id, 7));
            expect(query.limit).toHaveBeenCalledWith(1);
        });
    });

    describe('delete', () => {
        it('executes delete query', async () => {
            const { deleteSpy, where } = makeDeleteChain();

            const result = await repo.delete(5);

            expect(deleteSpy).toHaveBeenCalledWith(subcategories);
            expect(where).toHaveBeenCalledWith(eq(subcategories.id, 5));
            expect(result).toBeUndefined();
        });
    });
});



