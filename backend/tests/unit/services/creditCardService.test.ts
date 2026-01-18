import { CreditCardService } from '../../../src/service/creditCardService';
import { CreditCardRepository } from '../../../src/repositories/creditCardRepository';
import { AccountService } from '../../../src/service/accountService';
import { UserService } from '../../../src/service/userService';
import { CreditCardFlag, Operator } from '../../../src/utils/enum';
import { Resource } from '../../../src/utils/resources/resource';
import { ResourceBase } from '../../../src/utils/resources/languages/resourceService';
import { SelectCreditCard } from '../../../src/db/schema';
import { makeAccount, makeUser } from '../../helpers/factories';

const translate = (resource: Resource) => ResourceBase.translate(resource, 'en-US');
const isResource = (value: string): value is Resource => value in Resource;

const makeCreditCard = (overrides: Partial<SelectCreditCard> = {}): SelectCreditCard => {
    const now = new Date('2024-01-01T00:00:00Z');
    return {
        id: overrides.id ?? 1,
        name: overrides.name ?? 'Visa Gold',
        flag: overrides.flag ?? CreditCardFlag.VISA,
        observation: overrides.observation ?? 'Primary card',
        balance: overrides.balance ?? '0.00',
        limit: overrides.limit ?? '0.00',
        active: overrides.active ?? true,
        userId: overrides.userId ?? 1,
        accountId: overrides.accountId ?? null,
        createdAt: overrides.createdAt ?? now,
        updatedAt: overrides.updatedAt ?? now,
    };
};

describe('CreditCardService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('createCreditCard', () => {
        it('returns user not found when linked user is missing', async () => {
            jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({
                success: false,
                error: Resource.USER_NOT_FOUND,
            });
            const accountSpy = jest.spyOn(AccountService.prototype, 'getAccountById');
            const createSpy = jest.spyOn(CreditCardRepository.prototype, 'create');

            const service = new CreditCardService();
            const result = await service.createCreditCard({
                name: 'Card',
                flag: CreditCardFlag.VISA,
                userId: 9,
            });

            expect(accountSpy).not.toHaveBeenCalled();
            expect(createSpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.USER_NOT_FOUND });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.USER_NOT_FOUND);
                expect(translate(result.error)).toBe(translate(Resource.USER_NOT_FOUND));
            }
        });

        it('returns account not found when linked account is missing', async () => {
            const { password: _ignored, ...sanitized } = makeUser({ id: 2 });
            jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({ success: true, data: sanitized });
            jest.spyOn(AccountService.prototype, 'getAccountById').mockResolvedValue({
                success: false,
                error: Resource.ACCOUNT_NOT_FOUND,
            });
            const findManySpy = jest.spyOn(CreditCardRepository.prototype, 'findMany');

            const service = new CreditCardService();
            const result = await service.createCreditCard({
                name: 'Card',
                flag: CreditCardFlag.VISA,
                userId: 2,
                accountId: 15,
            });

            expect(findManySpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.ACCOUNT_NOT_FOUND });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.ACCOUNT_NOT_FOUND);
                expect(translate(result.error)).toBe(translate(Resource.ACCOUNT_NOT_FOUND));
            }
        });

        it('returns data already exists when account already has a card', async () => {
            const { password: _ignored, ...sanitized } = makeUser({ id: 3 });
            jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({ success: true, data: sanitized });
            jest.spyOn(AccountService.prototype, 'getAccountById').mockResolvedValue({
                success: true,
                data: makeAccount({ id: 12 }),
            });
            const findManySpy = jest.spyOn(CreditCardRepository.prototype, 'findMany').mockResolvedValue([
                makeCreditCard({ id: 8, accountId: 12 }),
            ]);
            const createSpy = jest.spyOn(CreditCardRepository.prototype, 'create');

            const service = new CreditCardService();
            const result = await service.createCreditCard({
                name: 'Card',
                flag: CreditCardFlag.VISA,
                userId: 3,
                accountId: 12,
            });

            expect(findManySpy).toHaveBeenCalledWith({ accountId: { operator: Operator.EQUAL, value: 12 } });
            expect(createSpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.DATA_ALREADY_EXISTS });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.DATA_ALREADY_EXISTS);
                expect(translate(result.error)).toBe(translate(Resource.DATA_ALREADY_EXISTS));
            }
        });

        it('creates credit card when account is valid', async () => {
            const { password: _ignored, ...sanitized } = makeUser({ id: 4 });
            jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({ success: true, data: sanitized });
            jest.spyOn(AccountService.prototype, 'getAccountById').mockResolvedValue({ success: true, data: makeAccount({ id: 20 }) });
            jest.spyOn(CreditCardRepository.prototype, 'findMany').mockResolvedValue([]);
            const created = makeCreditCard({ id: 10, userId: 4, accountId: 20 });
            const createSpy = jest.spyOn(CreditCardRepository.prototype, 'create').mockResolvedValue(created);

            const service = new CreditCardService();
            const result = await service.createCreditCard({
                name: 'Card',
                flag: CreditCardFlag.VISA,
                userId: 4,
                accountId: 20,
                limit: 5000,
                active: true,
            });

            expect(createSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Card',
                    flag: CreditCardFlag.VISA,
                    userId: 4,
                    accountId: 20,
                    limit: '5000.00',
                    active: true,
                })
            );
            expect(result).toEqual({ success: true, data: created });
        });

        it('creates credit card when account is not provided', async () => {
            const { password: _ignored, ...sanitized } = makeUser({ id: 5 });
            jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({ success: true, data: sanitized });
            const accountSpy = jest.spyOn(AccountService.prototype, 'getAccountById');
            const created = makeCreditCard({ id: 11, userId: 5, accountId: null });
            const createSpy = jest.spyOn(CreditCardRepository.prototype, 'create').mockResolvedValue(created);

            const service = new CreditCardService();
            const result = await service.createCreditCard({
                name: 'Card',
                flag: CreditCardFlag.MASTERCARD,
                userId: 5,
            });

            expect(accountSpy).not.toHaveBeenCalled();
            expect(createSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Card',
                    flag: CreditCardFlag.MASTERCARD,
                    userId: 5,
                    accountId: undefined,
                })
            );
            expect(result).toEqual({ success: true, data: created });
        });

        it('returns internal server error when repository create fails', async () => {
            const { password: _ignored, ...sanitized } = makeUser({ id: 6 });
            jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({ success: true, data: sanitized });
            jest.spyOn(CreditCardRepository.prototype, 'create').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new CreditCardService();
            const result = await service.createCreditCard({
                name: 'Card',
                flag: CreditCardFlag.AMEX,
                userId: 6,
            });

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });

    describe('getCreditCards', () => {
        it('returns credit cards when repository succeeds', async () => {
            const cards = [makeCreditCard({ id: 1 }), makeCreditCard({ id: 2 })];
            const findManySpy = jest.spyOn(CreditCardRepository.prototype, 'findMany').mockResolvedValue(cards);

            const service = new CreditCardService();
            const result = await service.getCreditCards({ limit: 2, offset: 2, sort: 'name', order: Operator.DESC });

            expect(findManySpy).toHaveBeenCalledWith(undefined, {
                limit: 2,
                offset: 2,
                sort: 'name',
                order: 'desc',
            });
            expect(result).toEqual({ success: true, data: cards });
        });

        it('returns internal server error when repository throws', async () => {
            jest.spyOn(CreditCardRepository.prototype, 'findMany').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new CreditCardService();
            const result = await service.getCreditCards();

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });

    describe('countCreditCards', () => {
        it('returns total count when repository succeeds', async () => {
            const countSpy = jest.spyOn(CreditCardRepository.prototype, 'count').mockResolvedValue(5);

            const service = new CreditCardService();
            const result = await service.countCreditCards();

            expect(countSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual({ success: true, data: 5 });
        });

        it('returns internal server error when repository throws', async () => {
            jest.spyOn(CreditCardRepository.prototype, 'count').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new CreditCardService();
            const result = await service.countCreditCards();

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });

    describe('getCreditCardById', () => {
        it('returns credit card not found when repository returns null', async () => {
            const findSpy = jest.spyOn(CreditCardRepository.prototype, 'findById').mockResolvedValue(null);

            const service = new CreditCardService();
            const result = await service.getCreditCardById(2);

            expect(findSpy).toHaveBeenCalledWith(2);
            expect(result).toEqual({ success: false, error: Resource.CREDIT_CARD_NOT_FOUND });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.CREDIT_CARD_NOT_FOUND);
                expect(translate(result.error)).toBe(translate(Resource.CREDIT_CARD_NOT_FOUND));
            }
        });

        it('returns credit card when repository returns a record', async () => {
            const card = makeCreditCard({ id: 3 });
            jest.spyOn(CreditCardRepository.prototype, 'findById').mockResolvedValue(card);

            const service = new CreditCardService();
            const result = await service.getCreditCardById(3);

            expect(result).toEqual({ success: true, data: card });
        });

        it('throws when repository lookup rejects', async () => {
            jest.spyOn(CreditCardRepository.prototype, 'findById').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new CreditCardService();
            let caught: unknown;

            try {
                await service.getCreditCardById(4);
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

    describe('getCreditCardsByUser', () => {
        it('returns credit cards when repository succeeds', async () => {
            const cards = [makeCreditCard({ id: 4, userId: 7 })];
            const findManySpy = jest.spyOn(CreditCardRepository.prototype, 'findMany').mockResolvedValue(cards);

            const service = new CreditCardService();
            const result = await service.getCreditCardsByUser(7, { limit: 5, offset: 0, sort: 'name', order: Operator.ASC });

            expect(findManySpy).toHaveBeenCalledWith(
                { userId: { operator: Operator.EQUAL, value: 7 } },
                { limit: 5, offset: 0, sort: 'name', order: 'asc' }
            );
            expect(result).toEqual({ success: true, data: cards });
        });

        it('returns internal server error when repository throws', async () => {
            jest.spyOn(CreditCardRepository.prototype, 'findMany').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new CreditCardService();
            const result = await service.getCreditCardsByUser(7);

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });

    describe('countCreditCardsByUser', () => {
        it('returns count when repository succeeds', async () => {
            const countSpy = jest.spyOn(CreditCardRepository.prototype, 'count').mockResolvedValue(2);

            const service = new CreditCardService();
            const result = await service.countCreditCardsByUser(7);

            expect(countSpy).toHaveBeenCalledWith({ userId: { operator: Operator.EQUAL, value: 7 } });
            expect(result).toEqual({ success: true, data: 2 });
        });

        it('returns internal server error when repository throws', async () => {
            jest.spyOn(CreditCardRepository.prototype, 'count').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new CreditCardService();
            const result = await service.countCreditCardsByUser(7);

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });

    describe('updateCreditCard', () => {
        it('returns user not found when new user is invalid', async () => {
            jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({
                success: false,
                error: Resource.USER_NOT_FOUND,
            });
            const updateSpy = jest.spyOn(CreditCardRepository.prototype, 'update');

            const service = new CreditCardService();
            const result = await service.updateCreditCard(2, { userId: 99 });

            expect(updateSpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.USER_NOT_FOUND });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.USER_NOT_FOUND);
                expect(translate(result.error)).toBe(translate(Resource.USER_NOT_FOUND));
            }
        });

        it('updates credit card with null accountId without account validation', async () => {
            const { password: _ignored, ...sanitized } = makeUser({ id: 8 });
            jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({ success: true, data: sanitized });
            const accountSpy = jest.spyOn(AccountService.prototype, 'getAccountById');
            const findManySpy = jest.spyOn(CreditCardRepository.prototype, 'findMany');
            const updated = makeCreditCard({ id: 5, accountId: null });
            const updateSpy = jest.spyOn(CreditCardRepository.prototype, 'update').mockResolvedValue(updated);

            const service = new CreditCardService();
            const result = await service.updateCreditCard(5, { accountId: null });

            expect(accountSpy).not.toHaveBeenCalled();
            expect(findManySpy).not.toHaveBeenCalled();
            expect(updateSpy).toHaveBeenCalledWith(5, expect.objectContaining({ accountId: null }));
            expect(result).toEqual({ success: true, data: updated });
        });

        it('returns account not found when account validation fails', async () => {
            const { password: _ignored, ...sanitized } = makeUser({ id: 9 });
            jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({ success: true, data: sanitized });
            jest.spyOn(AccountService.prototype, 'getAccountById').mockResolvedValue({
                success: false,
                error: Resource.ACCOUNT_NOT_FOUND,
            });
            const updateSpy = jest.spyOn(CreditCardRepository.prototype, 'update');

            const service = new CreditCardService();
            const result = await service.updateCreditCard(6, { accountId: 33 });

            expect(updateSpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.ACCOUNT_NOT_FOUND });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.ACCOUNT_NOT_FOUND);
                expect(translate(result.error)).toBe(translate(Resource.ACCOUNT_NOT_FOUND));
            }
        });

        it('returns data already exists when account is already linked to another card', async () => {
            const { password: _ignored, ...sanitized } = makeUser({ id: 10 });
            jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({ success: true, data: sanitized });
            jest.spyOn(AccountService.prototype, 'getAccountById').mockResolvedValue({ success: true, data: makeAccount({ id: 40 }) });
            jest.spyOn(CreditCardRepository.prototype, 'findMany').mockResolvedValue([
                makeCreditCard({ id: 99, accountId: 40 }),
            ]);
            const updateSpy = jest.spyOn(CreditCardRepository.prototype, 'update');

            const service = new CreditCardService();
            const result = await service.updateCreditCard(7, { accountId: 40 });

            expect(updateSpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.DATA_ALREADY_EXISTS });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.DATA_ALREADY_EXISTS);
                expect(translate(result.error)).toBe(translate(Resource.DATA_ALREADY_EXISTS));
            }
        });

        it('updates credit card when validations succeed', async () => {
            const { password: _ignored, ...sanitized } = makeUser({ id: 11 });
            jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({ success: true, data: sanitized });
            jest.spyOn(AccountService.prototype, 'getAccountById').mockResolvedValue({ success: true, data: makeAccount({ id: 50 }) });
            jest.spyOn(CreditCardRepository.prototype, 'findMany').mockResolvedValue([
                makeCreditCard({ id: 8, accountId: 50 }),
            ]);
            const updated = makeCreditCard({ id: 8, accountId: 50, name: 'Updated' });
            const updateSpy = jest.spyOn(CreditCardRepository.prototype, 'update').mockResolvedValue(updated);

            const service = new CreditCardService();
            const result = await service.updateCreditCard(8, { accountId: 50, name: 'Updated' });

            expect(updateSpy).toHaveBeenCalledWith(8, expect.objectContaining({ accountId: 50, name: 'Updated' }));
            expect(result).toEqual({ success: true, data: updated });
        });

        it('returns internal server error when repository update throws', async () => {
            const { password: _ignored, ...sanitized } = makeUser({ id: 12 });
            jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({ success: true, data: sanitized });
            jest.spyOn(AccountService.prototype, 'getAccountById').mockResolvedValue({ success: true, data: makeAccount({ id: 60 }) });
            jest.spyOn(CreditCardRepository.prototype, 'findMany').mockResolvedValue([]);
            jest.spyOn(CreditCardRepository.prototype, 'update').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new CreditCardService();
            const result = await service.updateCreditCard(9, { accountId: 60 });

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });

    describe('deleteCreditCard', () => {
        it('returns credit card not found when repository returns null', async () => {
            const findSpy = jest.spyOn(CreditCardRepository.prototype, 'findById').mockResolvedValue(null);
            const deleteSpy = jest.spyOn(CreditCardRepository.prototype, 'delete');

            const service = new CreditCardService();
            const result = await service.deleteCreditCard(10);

            expect(findSpy).toHaveBeenCalledWith(10);
            expect(deleteSpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.CREDIT_CARD_NOT_FOUND });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.CREDIT_CARD_NOT_FOUND);
                expect(translate(result.error)).toBe(translate(Resource.CREDIT_CARD_NOT_FOUND));
            }
        });

        it('deletes and returns id when credit card exists', async () => {
            const card = makeCreditCard({ id: 11 });
            jest.spyOn(CreditCardRepository.prototype, 'findById').mockResolvedValue(card);
            const deleteSpy = jest.spyOn(CreditCardRepository.prototype, 'delete').mockResolvedValue();

            const service = new CreditCardService();
            const result = await service.deleteCreditCard(11);

            expect(deleteSpy).toHaveBeenCalledWith(11);
            expect(result).toEqual({ success: true, data: { id: 11 } });
        });

        it('returns internal server error when repository delete throws', async () => {
            const card = makeCreditCard({ id: 12 });
            jest.spyOn(CreditCardRepository.prototype, 'findById').mockResolvedValue(card);
            jest.spyOn(CreditCardRepository.prototype, 'delete').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new CreditCardService();
            const result = await service.deleteCreditCard(12);

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });
});
