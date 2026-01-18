import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import { TagRepository } from '../../../src/repositories/tagRepository';
import { db } from '../../../src/db';
import { tags, SelectTag } from '../../../src/db/schema';
import { Operator } from '../../../src/utils/enum';

const makeTag = (overrides: Partial<SelectTag> = {}): SelectTag => {
    const now = new Date('2024-01-01T00:00:00Z');
    return {
        id: overrides.id ?? 1,
        userId: overrides.userId ?? 1,
        name: overrides.name ?? 'Urgent',
        active: overrides.active ?? true,
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

describe('TagRepository', () => {
    let repo: TagRepository;

    beforeEach(() => {
        repo = new TagRepository();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('findById', () => {
        it('returns tag when found', async () => {
            const tag = makeTag({ id: 1 });
            const { select, from, query } = makeSelectChain([tag]);

            const result = await repo.findById(1);

            expectSelectChain(select, from, tags);
            expect(query.where).toHaveBeenCalledWith(eq(tags.id, 1));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(tag);
        });

        it('returns null when not found', async () => {
            const { select, from, query } = makeSelectChain([]);

            const result = await repo.findById(99);

            expectSelectChain(select, from, tags);
            expect(query.where).toHaveBeenCalledWith(eq(tags.id, 99));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toBeNull();
        });
    });

    describe('findMany', () => {
        it('returns all tags when no filters', async () => {
            const list = [makeTag({ id: 1 }), makeTag({ id: 2 })];
            const { select, from, query } = makeSelectChain(list);

            const result = await repo.findMany();

            expectSelectChain(select, from, tags);
            expect(query.where).not.toHaveBeenCalled();
            expect(query.orderBy).not.toHaveBeenCalled();
            expect(query.limit).not.toHaveBeenCalled();
            expect(query.offset).not.toHaveBeenCalled();
            expect(result).toEqual(list);
        });

        it('applies id filter with IN', async () => {
            const { select, from, query } = makeSelectChain([makeTag({ id: 2 })]);

            await repo.findMany({ id: { operator: Operator.IN, value: [1, 2] } });

            expectSelectChain(select, from, tags);
            expect(query.where).toHaveBeenCalledWith(and(inArray(tags.id, [1, 2])));
        });

        it('applies userId filter', async () => {
            const { select, from, query } = makeSelectChain([makeTag({ id: 1, userId: 7 })]);

            await repo.findMany({ userId: { operator: Operator.EQUAL, value: 7 } });

            expectSelectChain(select, from, tags);
            expect(query.where).toHaveBeenCalledWith(and(eq(tags.userId, 7)));
        });

        it('applies active filter', async () => {
            const { select, from, query } = makeSelectChain([makeTag({ id: 1, active: false })]);

            await repo.findMany({ active: { operator: Operator.EQUAL, value: false } });

            expectSelectChain(select, from, tags);
            expect(query.where).toHaveBeenCalledWith(and(eq(tags.active, false)));
        });

        it('applies sorting asc', async () => {
            const { select, from, query } = makeSelectChain([makeTag({ id: 1 })]);

            await repo.findMany(undefined, { sort: 'name', order: 'asc' });

            expectSelectChain(select, from, tags);
            expect(query.orderBy).toHaveBeenCalledWith(asc(tags.name));
        });

        it('applies sorting desc', async () => {
            const { select, from, query } = makeSelectChain([makeTag({ id: 1 })]);

            await repo.findMany(undefined, { sort: 'name', order: 'desc' });

            expectSelectChain(select, from, tags);
            expect(query.orderBy).toHaveBeenCalledWith(desc(tags.name));
        });

        it('applies pagination', async () => {
            const { select, from, query } = makeSelectChain([makeTag({ id: 1 })]);

            await repo.findMany(undefined, { limit: 5, offset: 10 });

            expectSelectChain(select, from, tags);
            expect(query.limit).toHaveBeenCalledWith(5);
            expect(query.offset).toHaveBeenCalledWith(10);
        });
    });

    describe('count', () => {
        it('returns count when no filters', async () => {
            const { select, from, query } = makeSelectChain([{}, {}, {}]);

            const result = await repo.count();

            expectSelectChain(select, from, tags);
            expect(select).toHaveBeenCalledWith({ count: tags.id });
            expect(query.where).not.toHaveBeenCalled();
            expect(result).toBe(3);
        });

        it('applies filters to count', async () => {
            const { select, from, query } = makeSelectChain([{}, {}]);

            const result = await repo.count({ userId: { operator: Operator.EQUAL, value: 2 } });

            expectSelectChain(select, from, tags);
            expect(select).toHaveBeenCalledWith({ count: tags.id });
            expect(query.where).toHaveBeenCalledWith(and(eq(tags.userId, 2)));
            expect(result).toBe(2);
        });
    });

    describe('create', () => {
        it('inserts and returns created tag', async () => {
            const data = {
                name: 'Urgent',
                userId: 4,
                active: true,
            };
            const created = makeTag({ id: 10, userId: 4, name: data.name });
            const { insert, values } = makeInsertChain(10);
            const { select, from, query } = makeSelectChain([created]);

            const result = await repo.create(data);

            expect(insert).toHaveBeenCalledWith(tags);
            expect(values).toHaveBeenCalledWith(data);
            expectSelectChain(select, from, tags);
            expect(query.where).toHaveBeenCalledWith(eq(tags.id, 10));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(created);
        });
    });

    describe('update', () => {
        it('updates and returns tag', async () => {
            const updates = { name: 'Updated' };
            const updated = makeTag({ id: 7, name: 'Updated' });
            const { update, set, where } = makeUpdateChain();
            const { select, from, query } = makeSelectChain([updated]);

            const result = await repo.update(7, updates);

            expect(update).toHaveBeenCalledWith(tags);
            expect(set).toHaveBeenCalledWith(updates);
            expect(where).toHaveBeenCalledWith(eq(tags.id, 7));
            expectSelectChain(select, from, tags);
            expect(query.where).toHaveBeenCalledWith(eq(tags.id, 7));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(updated);
        });
    });

    describe('delete', () => {
        it('executes delete query', async () => {
            const { deleteSpy, where } = makeDeleteChain();

            const result = await repo.delete(5);

            expect(deleteSpy).toHaveBeenCalledWith(tags);
            expect(where).toHaveBeenCalledWith(eq(tags.id, 5));
            expect(result).toBeUndefined();
        });
    });
});
