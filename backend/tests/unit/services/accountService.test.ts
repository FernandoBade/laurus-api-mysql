import { AccountService } from '../../../src/service/accountService';
import { AccountRepository } from '../../../src/repositories/accountRepository';
import { UserService } from '../../../src/service/userService';
import { Operator } from '../../../src/utils/enum';
import { Resource } from '../../../src/utils/resources/resource';
import { ResourceBase } from '../../../src/utils/resources/languages/resourceService';
import { makeAccount, makeAccountInput, makeUser } from '../../helpers/factories';

const translate = (resource: Resource) => ResourceBase.translate(resource, 'en-US');
const isResource = (value: string): value is Resource => value in Resource;

describe('AccountService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('createAccount', () => {
        it('returns user not found when linked user is missing', async () => {
            const payload = makeAccountInput({ userId: 9 });
            const getUserSpy = jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({
                success: false,
                error: Resource.USER_NOT_FOUND,
            });
            const createSpy = jest.spyOn(AccountRepository.prototype, 'create');

            const service = new AccountService();
            const result = await service.createAccount(payload);

            expect(getUserSpy).toHaveBeenCalledWith(9);
            expect(createSpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.USER_NOT_FOUND });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.USER_NOT_FOUND);
                expect(translate(result.error)).toBe(translate(Resource.USER_NOT_FOUND));
            }
        });

        it('creates account when user exists', async () => {
            const payload = makeAccountInput({ userId: 2 });
            const { password: _ignored, ...sanitized } = makeUser({ id: 2 });
            jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({ success: true, data: sanitized });
            const created = makeAccount({ id: 11, userId: 2 });
            const createSpy = jest.spyOn(AccountRepository.prototype, 'create').mockResolvedValue(created);

            const service = new AccountService();
            const result = await service.createAccount(payload);

            expect(createSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: payload.name,
                    institution: payload.institution,
                    type: payload.type,
                    observation: payload.observation,
                    userId: payload.userId,
                    active: payload.active,
                })
            );
            expect(result).toEqual({ success: true, data: created });
        });

        it('returns internal server error when repository create fails', async () => {
            const payload = makeAccountInput({ userId: 3 });
            const { password: _ignored, ...sanitized } = makeUser({ id: 3 });
            jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({ success: true, data: sanitized });
            jest.spyOn(AccountRepository.prototype, 'create').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new AccountService();
            const result = await service.createAccount(payload);

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });

    describe('getAccounts', () => {
        it('returns accounts when repository succeeds', async () => {
            const accounts = [makeAccount({ id: 1 }), makeAccount({ id: 2 })];
            const findManySpy = jest.spyOn(AccountRepository.prototype, 'findMany').mockResolvedValue(accounts);

            const service = new AccountService();
            const result = await service.getAccounts({ limit: 2, offset: 0, sort: 'name', order: Operator.DESC });

            expect(findManySpy).toHaveBeenCalledWith(undefined, {
                limit: 2,
                offset: 0,
                sort: 'name',
                order: 'desc',
            });
            expect(result).toEqual({ success: true, data: accounts });
        });

        it('returns internal server error when repository throws', async () => {
            jest.spyOn(AccountRepository.prototype, 'findMany').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new AccountService();
            const result = await service.getAccounts();

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });

    describe('countAccounts', () => {
        it('returns total count when repository succeeds', async () => {
            const countSpy = jest.spyOn(AccountRepository.prototype, 'count').mockResolvedValue(6);

            const service = new AccountService();
            const result = await service.countAccounts();

            expect(countSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual({ success: true, data: 6 });
        });

        it('returns internal server error when repository throws', async () => {
            jest.spyOn(AccountRepository.prototype, 'count').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new AccountService();
            const result = await service.countAccounts();

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });

    describe('getAccountById', () => {
        it('returns no records found when repository returns null', async () => {
            const findSpy = jest.spyOn(AccountRepository.prototype, 'findById').mockResolvedValue(null);

            const service = new AccountService();
            const result = await service.getAccountById(10);

            expect(findSpy).toHaveBeenCalledWith(10);
            expect(result).toEqual({ success: false, error: Resource.NO_RECORDS_FOUND });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.NO_RECORDS_FOUND);
                expect(translate(result.error)).toBe(translate(Resource.NO_RECORDS_FOUND));
            }
        });

        it('returns account when repository returns a record', async () => {
            const account = makeAccount({ id: 12 });
            jest.spyOn(AccountRepository.prototype, 'findById').mockResolvedValue(account);

            const service = new AccountService();
            const result = await service.getAccountById(12);

            expect(result).toEqual({ success: true, data: account });
        });

        it('throws when repository lookup rejects', async () => {
            jest.spyOn(AccountRepository.prototype, 'findById').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new AccountService();
            let caught: unknown;

            try {
                await service.getAccountById(13);
            } catch (error) {
                caught = error;
            }

            expect(caught).toBeInstanceOf(Error);
            if (caught instanceof Error) {
                expect(isResource(caught.message)).toBe(true);
                if (isResource(caught.message)) {
                    expect(translate(caught.message)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
                }
            }
        });
    });

    describe('getAccountsByUser', () => {
        it('returns accounts when repository succeeds', async () => {
            const accounts = [makeAccount({ id: 3, userId: 4 })];
            const findManySpy = jest.spyOn(AccountRepository.prototype, 'findMany').mockResolvedValue(accounts);

            const service = new AccountService();
            const result = await service.getAccountsByUser(4, { limit: 3, offset: 6, sort: 'name', order: Operator.ASC });

            expect(findManySpy).toHaveBeenCalledWith(
                { userId: { operator: Operator.EQUAL, value: 4 } },
                { limit: 3, offset: 6, sort: 'name', order: 'asc' }
            );
            expect(result).toEqual({ success: true, data: accounts });
        });

        it('returns internal server error when repository throws', async () => {
            jest.spyOn(AccountRepository.prototype, 'findMany').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new AccountService();
            const result = await service.getAccountsByUser(4);

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });

    describe('countAccountsByUser', () => {
        it('returns count when repository succeeds', async () => {
            const countSpy = jest.spyOn(AccountRepository.prototype, 'count').mockResolvedValue(2);

            const service = new AccountService();
            const result = await service.countAccountsByUser(5);

            expect(countSpy).toHaveBeenCalledWith({ userId: { operator: Operator.EQUAL, value: 5 } });
            expect(result).toEqual({ success: true, data: 2 });
        });

        it('returns internal server error when repository throws', async () => {
            jest.spyOn(AccountRepository.prototype, 'count').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new AccountService();
            const result = await service.countAccountsByUser(5);

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });

    describe('updateAccount', () => {
        it('returns user not found when new user is invalid', async () => {
            const getUserSpy = jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({
                success: false,
                error: Resource.USER_NOT_FOUND,
            });
            const updateSpy = jest.spyOn(AccountRepository.prototype, 'update');

            const service = new AccountService();
            const result = await service.updateAccount(7, { userId: 99 });

            expect(getUserSpy).toHaveBeenCalledWith(99);
            expect(updateSpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.USER_NOT_FOUND });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.USER_NOT_FOUND);
                expect(translate(result.error)).toBe(translate(Resource.USER_NOT_FOUND));
            }
        });

        it('updates account when validation succeeds', async () => {
            const { password: _ignored, ...sanitized } = makeUser({ id: 8 });
            jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({ success: true, data: sanitized });
            const updated = makeAccount({ id: 8, userId: 8, name: 'Updated' });
            const updateSpy = jest.spyOn(AccountRepository.prototype, 'update').mockResolvedValue(updated);

            const service = new AccountService();
            const result = await service.updateAccount(8, { userId: 8, name: 'Updated' });

            expect(updateSpy).toHaveBeenCalledWith(8, expect.objectContaining({ userId: 8, name: 'Updated' }));
            expect(result).toEqual({ success: true, data: updated });
        });

        it('returns internal server error when repository update throws', async () => {
            const { password: _ignored, ...sanitized } = makeUser({ id: 9 });
            jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({ success: true, data: sanitized });
            jest.spyOn(AccountRepository.prototype, 'update').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new AccountService();
            const result = await service.updateAccount(9, { userId: 9 });

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });

    describe('deleteAccount', () => {
        it('returns account not found when repository returns null', async () => {
            const findSpy = jest.spyOn(AccountRepository.prototype, 'findById').mockResolvedValue(null);
            const deleteSpy = jest.spyOn(AccountRepository.prototype, 'delete');

            const service = new AccountService();
            const result = await service.deleteAccount(15);

            expect(findSpy).toHaveBeenCalledWith(15);
            expect(deleteSpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.ACCOUNT_NOT_FOUND });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.ACCOUNT_NOT_FOUND);
                expect(translate(result.error)).toBe(translate(Resource.ACCOUNT_NOT_FOUND));
            }
        });

        it('deletes and returns id when account exists', async () => {
            const account = makeAccount({ id: 16 });
            jest.spyOn(AccountRepository.prototype, 'findById').mockResolvedValue(account);
            const deleteSpy = jest.spyOn(AccountRepository.prototype, 'delete').mockResolvedValue();

            const service = new AccountService();
            const result = await service.deleteAccount(16);

            expect(deleteSpy).toHaveBeenCalledWith(16);
            expect(result).toEqual({ success: true, data: { id: 16 } });
        });

        it('returns internal server error when repository delete throws', async () => {
            const account = makeAccount({ id: 17 });
            jest.spyOn(AccountRepository.prototype, 'findById').mockResolvedValue(account);
            jest.spyOn(AccountRepository.prototype, 'delete').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new AccountService();
            const result = await service.deleteAccount(17);

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });
});
