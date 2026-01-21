import { and, asc, desc, eq, like } from 'drizzle-orm';
import { UserRepository } from '../../../src/repositories/userRepository';
import { db } from '../../../src/db';
import { users } from '../../../src/db/schema';
import { Operator } from '../../../../shared/enums';
import { makeDbUser } from '../../helpers/factories';

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

describe('UserRepository', () => {
    let repo: UserRepository;

    beforeEach(() => {
        repo = new UserRepository();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('findById', () => {
        it('returns user when found', async () => {
            const user = makeDbUser({ id: 1 });
            const { select, from, query } = makeSelectChain([user]);

            const result = await repo.findById(1);

            expectSelectChain(select, from, users);
            expect(query.where).toHaveBeenCalledWith(eq(users.id, 1));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(user);
        });

        it('returns null when not found', async () => {
            const { select, from, query } = makeSelectChain([]);

            const result = await repo.findById(99);

            expectSelectChain(select, from, users);
            expect(query.where).toHaveBeenCalledWith(eq(users.id, 99));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toBeNull();
        });
    });

    describe('findMany', () => {
        it('returns all users when no filters', async () => {
            const list = [makeDbUser({ id: 1 }), makeDbUser({ id: 2 })];
            const { select, from, query } = makeSelectChain(list);

            const result = await repo.findMany();

            expectSelectChain(select, from, users);
            expect(query.where).not.toHaveBeenCalled();
            expect(query.orderBy).not.toHaveBeenCalled();
            expect(query.limit).not.toHaveBeenCalled();
            expect(query.offset).not.toHaveBeenCalled();
            expect(result).toEqual(list);
        });

        it('applies email equal filter', async () => {
            const { select, from, query } = makeSelectChain([makeDbUser({ id: 1 })]);

            await repo.findMany({ email: { operator: Operator.EQUAL, value: 'user@example.com' } });

            expectSelectChain(select, from, users);
            expect(query.where).toHaveBeenCalledWith(and(eq(users.email, 'user@example.com')));
        });

        it('applies email like filter', async () => {
            const { select, from, query } = makeSelectChain([makeDbUser({ id: 1 })]);

            await repo.findMany({ email: { operator: Operator.LIKE, value: 'example' } });

            expectSelectChain(select, from, users);
            expect(query.where).toHaveBeenCalledWith(and(like(users.email, '%example%')));
        });

        it('applies active filter', async () => {
            const { select, from, query } = makeSelectChain([makeDbUser({ id: 1, active: false })]);

            await repo.findMany({ active: { operator: Operator.EQUAL, value: false } });

            expectSelectChain(select, from, users);
            expect(query.where).toHaveBeenCalledWith(and(eq(users.active, false)));
        });

        it('applies combined filters', async () => {
            const { select, from, query } = makeSelectChain([makeDbUser({ id: 1, active: true })]);

            await repo.findMany({
                email: { operator: Operator.EQUAL, value: 'user@example.com' },
                active: { operator: Operator.EQUAL, value: true },
            });

            expectSelectChain(select, from, users);
            expect(query.where).toHaveBeenCalledWith(and(eq(users.email, 'user@example.com'), eq(users.active, true)));
        });

        it('applies sorting asc', async () => {
            const { select, from, query } = makeSelectChain([makeDbUser({ id: 1 })]);

            await repo.findMany(undefined, { sort: 'email', order: 'asc' });

            expectSelectChain(select, from, users);
            expect(query.orderBy).toHaveBeenCalledWith(asc(users.email));
        });

        it('applies sorting desc', async () => {
            const { select, from, query } = makeSelectChain([makeDbUser({ id: 1 })]);

            await repo.findMany(undefined, { sort: 'email', order: 'desc' });

            expectSelectChain(select, from, users);
            expect(query.orderBy).toHaveBeenCalledWith(desc(users.email));
        });

        it('applies pagination', async () => {
            const { select, from, query } = makeSelectChain([makeDbUser({ id: 1 })]);

            await repo.findMany(undefined, { limit: 5, offset: 10 });

            expectSelectChain(select, from, users);
            expect(query.limit).toHaveBeenCalledWith(5);
            expect(query.offset).toHaveBeenCalledWith(10);
        });

        it('returns empty array when no results', async () => {
            const { select, from, query } = makeSelectChain([]);

            const result = await repo.findMany();

            expectSelectChain(select, from, users);
            expect(query.where).not.toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe('count', () => {
        it('returns count when no filters', async () => {
            const { select, from, query } = makeSelectChain([{}, {}, {}]);

            const result = await repo.count();

            expectSelectChain(select, from, users);
            expect(select).toHaveBeenCalledWith({ count: users.id });
            expect(query.where).not.toHaveBeenCalled();
            expect(result).toBe(3);
        });

        it('applies filters to count', async () => {
            const { select, from, query } = makeSelectChain([{}, {}]);

            const result = await repo.count({ email: { operator: Operator.LIKE, value: 'example' } });

            expectSelectChain(select, from, users);
            expect(select).toHaveBeenCalledWith({ count: users.id });
            expect(query.where).toHaveBeenCalledWith(and(like(users.email, '%example%')));
            expect(result).toBe(2);
        });

        it('returns 0 when no results', async () => {
            const { select, from } = makeSelectChain([]);

            const result = await repo.count();

            expectSelectChain(select, from, users);
            expect(select).toHaveBeenCalledWith({ count: users.id });
            expect(result).toBe(0);
        });
    });

    describe('create', () => {
        it('inserts and returns created user', async () => {
            const data = { email: 'new@example.com', password: 'secret' };
            const created = makeDbUser({ id: 10, email: data.email });
            const { insert, values } = makeInsertChain(10);
            const { select, from, query } = makeSelectChain([created]);

            const result = await repo.create(data);

            expect(insert).toHaveBeenCalledWith(users);
            expect(values).toHaveBeenCalledWith(data);
            expectSelectChain(select, from, users);
            expect(query.where).toHaveBeenCalledWith(eq(users.id, 10));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(created);
        });

        it('throws invariant error when created record is missing', async () => {
            const data = { email: 'new@example.com', password: 'secret' };
            const { insert, values } = makeInsertChain(12);
            const { select, from, query } = makeSelectChain([]);

            await expect(repo.create(data)).rejects.toThrow('RepositoryInvariantViolation: created record not found');

            expect(insert).toHaveBeenCalledWith(users);
            expect(values).toHaveBeenCalledWith(data);
            expectSelectChain(select, from, users);
            expect(query.where).toHaveBeenCalledWith(eq(users.id, 12));
            expect(query.limit).toHaveBeenCalledWith(1);
        });
    });

    describe('update', () => {
        it('updates and returns user', async () => {
            const updates = { firstName: 'Updated' };
            const updated = makeDbUser({ id: 7, firstName: 'Updated' });
            const { update, set, where } = makeUpdateChain();
            const { select, from, query } = makeSelectChain([updated]);

            const result = await repo.update(7, updates);

            expect(update).toHaveBeenCalledWith(users);
            expect(set).toHaveBeenCalledWith(updates);
            expect(where).toHaveBeenCalledWith(eq(users.id, 7));
            expectSelectChain(select, from, users);
            expect(query.where).toHaveBeenCalledWith(eq(users.id, 7));
            expect(query.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(updated);
        });

        it('throws invariant error when updated record is missing', async () => {
            const updates = { firstName: 'Updated' };
            const { update, set, where } = makeUpdateChain();
            const { select, from, query } = makeSelectChain([]);

            await expect(repo.update(7, updates)).rejects.toThrow('RepositoryInvariantViolation: updated record not found');

            expect(update).toHaveBeenCalledWith(users);
            expect(set).toHaveBeenCalledWith(updates);
            expect(where).toHaveBeenCalledWith(eq(users.id, 7));
            expectSelectChain(select, from, users);
            expect(query.where).toHaveBeenCalledWith(eq(users.id, 7));
            expect(query.limit).toHaveBeenCalledWith(1);
        });
    });

    describe('delete', () => {
        it('executes delete query', async () => {
            const { deleteSpy, where } = makeDeleteChain();

            const result = await repo.delete(5);

            expect(deleteSpy).toHaveBeenCalledWith(users);
            expect(where).toHaveBeenCalledWith(eq(users.id, 5));
            expect(result).toBeUndefined();
        });
    });
});



