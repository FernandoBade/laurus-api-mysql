import { TransactionService } from '../../../src/service/transactionService';
import { TransactionRepository } from '../../../src/repositories/transactionRepository';
import { AccountRepository } from '../../../src/repositories/accountRepository';
import { CreditCardRepository } from '../../../src/repositories/creditCardRepository';
import { TagRepository } from '../../../src/repositories/tagRepository';
import { AccountService } from '../../../src/service/accountService';
import { CreditCardService } from '../../../src/service/creditCardService';
import { CategoryService } from '../../../src/service/categoryService';
import { SubcategoryService } from '../../../src/service/subcategoryService';
import { CategoryColor, CategoryType, CreditCardFlag, Operator, TransactionSource, TransactionType } from '../../../src/utils/enum';
import { Resource } from '../../../src/utils/resources/resource';
import { ResourceBase } from '../../../src/utils/resources/languages/resourceService';
import { SelectCategory, SelectCreditCard, SelectSubcategory, transactionTags } from '../../../src/db/schema';
import { makeAccount, makeTransaction, makeTransactionInput } from '../../helpers/factories';
import * as database from '../../../src/db';

const translate = (resource: Resource) => ResourceBase.translate(resource, 'en-US');
const isResource = (value: string): value is Resource => value in Resource;

const makeConnection = () => ({
    delete: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
    }),
    insert: jest.fn().mockReturnValue({
        values: jest.fn().mockResolvedValue([{ insertId: 1 }]),
    }),
});

let connection: ReturnType<typeof makeConnection>;

const makeCategory = (overrides: Partial<SelectCategory> = {}): SelectCategory => {
    const now = new Date('2024-01-01T00:00:00Z');
    return {
        id: overrides.id ?? 1,
        name: overrides.name ?? 'Category',
        type: overrides.type ?? CategoryType.EXPENSE,
        color: overrides.color ?? CategoryColor.BLUE,
        active: overrides.active ?? true,
        userId: overrides.userId ?? 1,
        createdAt: overrides.createdAt ?? now,
        updatedAt: overrides.updatedAt ?? now,
    };
};

const makeSubcategory = (overrides: Partial<SelectSubcategory> = {}): SelectSubcategory => {
    const now = new Date('2024-01-01T00:00:00Z');
    return {
        id: overrides.id ?? 1,
        name: overrides.name ?? 'Subcategory',
        active: overrides.active ?? true,
        categoryId: overrides.categoryId ?? 1,
        createdAt: overrides.createdAt ?? now,
        updatedAt: overrides.updatedAt ?? now,
    };
};

const makeCreditCard = (overrides: Partial<SelectCreditCard> = {}): SelectCreditCard => {
    const now = new Date('2024-01-01T00:00:00Z');
    return {
        id: overrides.id ?? 1,
        name: overrides.name ?? 'Card',
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

describe('TransactionService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        connection = makeConnection();
        jest.spyOn(database, 'withTransaction').mockImplementation(async (callback) => {
            return callback(connection as unknown as typeof database.db);
        });
        jest.spyOn(database.db, 'select').mockReturnValue({
            from: jest.fn().mockReturnValue({
                where: jest.fn().mockResolvedValue([]),
            }),
        } as unknown as ReturnType<typeof database.db.select>);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('createTransaction', () => {
        it('returns account not found when account source is invalid', async () => {
            jest.spyOn(AccountService.prototype, 'getAccountById').mockResolvedValue({
                success: false,
                error: Resource.ACCOUNT_NOT_FOUND,
            });
            const creditCardSpy = jest.spyOn(CreditCardService.prototype, 'getCreditCardById');
            const categorySpy = jest.spyOn(CategoryService.prototype, 'getCategoryById');
            const createSpy = jest.spyOn(TransactionRepository.prototype, 'create');

            const service = new TransactionService();
            const result = await service.createTransaction({
                value: 100,
                date: new Date('2024-01-01T00:00:00Z'),
                transactionType: TransactionType.EXPENSE,
                transactionSource: TransactionSource.ACCOUNT,
                isInstallment: false,
                isRecurring: false,
                accountId: 99,
                categoryId: 1,
            });

            expect(creditCardSpy).not.toHaveBeenCalled();
            expect(categorySpy).not.toHaveBeenCalled();
            expect(createSpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.ACCOUNT_NOT_FOUND });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.ACCOUNT_NOT_FOUND);
                expect(translate(result.error)).toBe(translate(Resource.ACCOUNT_NOT_FOUND));
            }
        });

        it('returns credit card not found when credit card source is invalid', async () => {
            jest.spyOn(CreditCardService.prototype, 'getCreditCardById').mockResolvedValue({
                success: false,
                error: Resource.CREDIT_CARD_NOT_FOUND,
            });
            const accountSpy = jest.spyOn(AccountService.prototype, 'getAccountById');
            const createSpy = jest.spyOn(TransactionRepository.prototype, 'create');

            const service = new TransactionService();
            const result = await service.createTransaction({
                value: 100,
                date: new Date('2024-01-01T00:00:00Z'),
                transactionType: TransactionType.EXPENSE,
                transactionSource: TransactionSource.CREDIT_CARD,
                isInstallment: false,
                isRecurring: false,
                creditCardId: 10,
                categoryId: 1,
            });

            expect(accountSpy).not.toHaveBeenCalled();
            expect(createSpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.CREDIT_CARD_NOT_FOUND });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.CREDIT_CARD_NOT_FOUND);
                expect(translate(result.error)).toBe(translate(Resource.CREDIT_CARD_NOT_FOUND));
            }
        });

        it('returns category or subcategory required when none provided', async () => {
            jest.spyOn(AccountService.prototype, 'getAccountById').mockResolvedValue({ success: true, data: makeAccount({ id: 1 }) });
            const categorySpy = jest.spyOn(CategoryService.prototype, 'getCategoryById');
            const subcategorySpy = jest.spyOn(SubcategoryService.prototype, 'getSubcategoryById');
            const createSpy = jest.spyOn(TransactionRepository.prototype, 'create');

            const service = new TransactionService();
            const result = await service.createTransaction({
                value: 100,
                date: new Date('2024-01-01T00:00:00Z'),
                transactionType: TransactionType.EXPENSE,
                transactionSource: TransactionSource.ACCOUNT,
                isInstallment: false,
                isRecurring: false,
                accountId: 1,
            });

            expect(categorySpy).not.toHaveBeenCalled();
            expect(subcategorySpy).not.toHaveBeenCalled();
            expect(createSpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED);
                expect(translate(result.error)).toBe(translate(Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED));
            }
        });

        it('returns category not found or inactive when category is invalid', async () => {
            jest.spyOn(AccountService.prototype, 'getAccountById').mockResolvedValue({ success: true, data: makeAccount({ id: 1 }) });
            jest.spyOn(CategoryService.prototype, 'getCategoryById').mockResolvedValue({
                success: false,
                error: Resource.CATEGORY_NOT_FOUND_OR_INACTIVE,
            });
            const createSpy = jest.spyOn(TransactionRepository.prototype, 'create');

            const service = new TransactionService();
            const result = await service.createTransaction({
                value: 100,
                date: new Date('2024-01-01T00:00:00Z'),
                transactionType: TransactionType.EXPENSE,
                transactionSource: TransactionSource.ACCOUNT,
                isInstallment: false,
                isRecurring: false,
                accountId: 1,
                categoryId: 99,
            });

            expect(createSpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.CATEGORY_NOT_FOUND_OR_INACTIVE });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.CATEGORY_NOT_FOUND_OR_INACTIVE);
                expect(translate(result.error)).toBe(translate(Resource.CATEGORY_NOT_FOUND_OR_INACTIVE));
            }
        });

        it('returns subcategory not found or inactive when subcategory is invalid', async () => {
            jest.spyOn(AccountService.prototype, 'getAccountById').mockResolvedValue({ success: true, data: makeAccount({ id: 1 }) });
            jest.spyOn(SubcategoryService.prototype, 'getSubcategoryById').mockResolvedValue({
                success: false,
                error: Resource.SUBCATEGORY_NOT_FOUND_OR_INACTIVE,
            });
            const createSpy = jest.spyOn(TransactionRepository.prototype, 'create');

            const service = new TransactionService();
            const result = await service.createTransaction({
                value: 100,
                date: new Date('2024-01-01T00:00:00Z'),
                transactionType: TransactionType.EXPENSE,
                transactionSource: TransactionSource.ACCOUNT,
                isInstallment: false,
                isRecurring: false,
                accountId: 1,
                subcategoryId: 3,
            });

            expect(createSpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.SUBCATEGORY_NOT_FOUND_OR_INACTIVE });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.SUBCATEGORY_NOT_FOUND_OR_INACTIVE);
                expect(translate(result.error)).toBe(translate(Resource.SUBCATEGORY_NOT_FOUND_OR_INACTIVE));
            }
        });

        it('creates transaction when validations succeed', async () => {
            jest.spyOn(AccountService.prototype, 'getAccountById').mockResolvedValue({ success: true, data: makeAccount({ id: 1 }) });
            jest.spyOn(CategoryService.prototype, 'getCategoryById').mockResolvedValue({ success: true, data: makeCategory({ id: 2, active: true }) });
            const accountRow = makeAccount({ id: 1, balance: '250.00' });
            jest.spyOn(AccountRepository.prototype, 'findById').mockResolvedValue(accountRow);
            const balanceSpy = jest.spyOn(AccountRepository.prototype, 'update').mockResolvedValue(accountRow);
            const created = makeTransaction({ id: 10, accountId: 1, categoryId: 2 });
            const createSpy = jest.spyOn(TransactionRepository.prototype, 'create').mockResolvedValue(created);

            const service = new TransactionService();
            const result = await service.createTransaction({
                value: 150,
                date: new Date('2024-02-01T00:00:00Z'),
                transactionType: TransactionType.EXPENSE,
                transactionSource: TransactionSource.ACCOUNT,
                isInstallment: false,
                isRecurring: false,
                accountId: 1,
                categoryId: 2,
                active: true,
            });

            expect(createSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    value: '150',
                    transactionType: TransactionType.EXPENSE,
                    transactionSource: TransactionSource.ACCOUNT,
                    isInstallment: false,
                    isRecurring: false,
                    accountId: 1,
                    categoryId: 2,
                    active: true,
                }),
                expect.anything()
            );
            expect(balanceSpy).toHaveBeenCalledWith(1, { balance: '100.00' }, expect.anything());
            expect(result).toEqual({ success: true, data: created });
        });

        it('links tags when provided', async () => {
            const account = makeAccount({ id: 1 });
            jest.spyOn(AccountService.prototype, 'getAccountById').mockResolvedValue({ success: true, data: account });
            jest.spyOn(CategoryService.prototype, 'getCategoryById').mockResolvedValue({ success: true, data: makeCategory({ id: 2, active: true }) });
            const accountRow = makeAccount({ id: 1, balance: '100.00' });
            jest.spyOn(AccountRepository.prototype, 'findById').mockResolvedValue(accountRow);
            jest.spyOn(AccountRepository.prototype, 'update').mockResolvedValue(accountRow);
            const tagSpy = jest.spyOn(TagRepository.prototype, 'findMany').mockResolvedValue([
                { id: 1, name: 'Urgent', userId: account.userId, active: true, createdAt: new Date(), updatedAt: new Date() },
                { id: 2, name: 'Family', userId: account.userId, active: true, createdAt: new Date(), updatedAt: new Date() },
            ]);
            const created = makeTransaction({ id: 12, accountId: 1, categoryId: 2, tags: [1, 2] });
            jest.spyOn(TransactionRepository.prototype, 'create').mockResolvedValue(created);

            const service = new TransactionService();
            const result = await service.createTransaction({
                value: 75,
                date: new Date('2024-02-05T00:00:00Z'),
                transactionType: TransactionType.EXPENSE,
                transactionSource: TransactionSource.ACCOUNT,
                isInstallment: false,
                isRecurring: false,
                accountId: 1,
                categoryId: 2,
                tags: [1, 2],
            });

            expect(tagSpy).toHaveBeenCalledWith({
                id: { operator: Operator.IN, value: [1, 2] },
                userId: { operator: Operator.EQUAL, value: account.userId },
                active: { operator: Operator.EQUAL, value: true },
            });
            expect(connection.delete).toHaveBeenCalledWith(transactionTags);
            expect(connection.insert).toHaveBeenCalledWith(transactionTags);
            const insertCall = connection.insert.mock.results[0]?.value as { values: jest.Mock };
            expect(insertCall.values).toHaveBeenCalledWith([
                { transactionId: created.id, tagId: 1 },
                { transactionId: created.id, tagId: 2 },
            ]);
            expect(result).toEqual({ success: true, data: created });
        });

        it('creates transaction for credit card source when validations succeed', async () => {
            jest.spyOn(CreditCardService.prototype, 'getCreditCardById').mockResolvedValue({ success: true, data: makeCreditCard({ id: 10 }) });
            jest.spyOn(SubcategoryService.prototype, 'getSubcategoryById').mockResolvedValue({ success: true, data: makeSubcategory({ id: 4, active: true }) });
            const cardRow = makeCreditCard({ id: 10, balance: '80.00' });
            jest.spyOn(CreditCardRepository.prototype, 'findById').mockResolvedValue(cardRow);
            const balanceSpy = jest.spyOn(CreditCardRepository.prototype, 'update').mockResolvedValue(cardRow);
            const created = makeTransaction({ id: 11, creditCardId: 10, transactionSource: TransactionSource.CREDIT_CARD, subcategoryId: 4 });
            const createSpy = jest.spyOn(TransactionRepository.prototype, 'create').mockResolvedValue(created);

            const service = new TransactionService();
            const result = await service.createTransaction({
                value: 200,
                date: new Date('2024-02-01T00:00:00Z'),
                transactionType: TransactionType.EXPENSE,
                transactionSource: TransactionSource.CREDIT_CARD,
                isInstallment: false,
                isRecurring: false,
                creditCardId: 10,
                subcategoryId: 4,
            });

            expect(createSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    value: '200',
                    transactionSource: TransactionSource.CREDIT_CARD,
                    creditCardId: 10,
                    subcategoryId: 4,
                }),
                expect.anything()
            );
            expect(balanceSpy).toHaveBeenCalledWith(10, { balance: '280.00' }, expect.anything());
            expect(result).toEqual({ success: true, data: created });
        });

        it('returns internal server error when repository create fails', async () => {
            jest.spyOn(AccountService.prototype, 'getAccountById').mockResolvedValue({ success: true, data: makeAccount({ id: 1 }) });
            jest.spyOn(CategoryService.prototype, 'getCategoryById').mockResolvedValue({ success: true, data: makeCategory({ id: 2, active: true }) });
            jest.spyOn(TransactionRepository.prototype, 'create').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new TransactionService();
            const result = await service.createTransaction({
                value: 100,
                date: new Date('2024-01-01T00:00:00Z'),
                transactionType: TransactionType.EXPENSE,
                transactionSource: TransactionSource.ACCOUNT,
                isInstallment: false,
                isRecurring: false,
                accountId: 1,
                categoryId: 2,
            });

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });

    describe('getTransactions', () => {
        it('returns transactions when repository succeeds', async () => {
            const transactions = [makeTransaction({ id: 1 }), makeTransaction({ id: 2 })];
            const findManySpy = jest.spyOn(TransactionRepository.prototype, 'findMany').mockResolvedValue(transactions);

            const service = new TransactionService();
            const result = await service.getTransactions(undefined, { limit: 2, offset: 2, sort: 'date', order: Operator.DESC });

            expect(findManySpy).toHaveBeenCalledWith(undefined, {
                limit: 2,
                offset: 2,
                sort: 'date',
                order: 'desc',
            });
            expect(result).toEqual({ success: true, data: transactions });
        });

        it('returns internal server error when repository throws', async () => {
            jest.spyOn(TransactionRepository.prototype, 'findMany').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new TransactionService();
            const result = await service.getTransactions();

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });

    describe('countTransactions', () => {
        it('returns total count when repository succeeds', async () => {
            const countSpy = jest.spyOn(TransactionRepository.prototype, 'count').mockResolvedValue(5);

            const service = new TransactionService();
            const result = await service.countTransactions();

            expect(countSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual({ success: true, data: 5 });
        });

        it('returns internal server error when repository throws', async () => {
            jest.spyOn(TransactionRepository.prototype, 'count').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new TransactionService();
            const result = await service.countTransactions();

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });

    describe('getTransactionById', () => {
        it('returns no records found when repository returns null', async () => {
            const findSpy = jest.spyOn(TransactionRepository.prototype, 'findById').mockResolvedValue(null);

            const service = new TransactionService();
            const result = await service.getTransactionById(4);

            expect(findSpy).toHaveBeenCalledWith(4);
            expect(result).toEqual({ success: false, error: Resource.NO_RECORDS_FOUND });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.NO_RECORDS_FOUND);
                expect(translate(result.error)).toBe(translate(Resource.NO_RECORDS_FOUND));
            }
        });

        it('returns transaction when repository returns a record', async () => {
            const transaction = makeTransaction({ id: 5 });
            jest.spyOn(TransactionRepository.prototype, 'findById').mockResolvedValue(transaction);

            const service = new TransactionService();
            const result = await service.getTransactionById(5);

            expect(result).toEqual({ success: true, data: transaction });
        });

        it('throws when repository lookup rejects', async () => {
            jest.spyOn(TransactionRepository.prototype, 'findById').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new TransactionService();
            let caught: unknown;

            try {
                await service.getTransactionById(6);
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

    describe('getTransactionsByAccount', () => {
        it('returns transactions when repository succeeds', async () => {
            const transactions = [makeTransaction({ id: 7, accountId: 3 })];
            const findManySpy = jest.spyOn(TransactionRepository.prototype, 'findMany').mockResolvedValue(transactions);

            const service = new TransactionService();
            const result = await service.getTransactionsByAccount(3, { limit: 3, offset: 3, sort: 'date', order: Operator.ASC });

            expect(findManySpy).toHaveBeenCalledWith(
                { accountId: { operator: Operator.EQUAL, value: 3 } },
                { limit: 3, offset: 3, sort: 'date', order: 'asc' }
            );
            expect(result).toEqual({ success: true, data: transactions });
        });

        it('returns internal server error when repository throws', async () => {
            jest.spyOn(TransactionRepository.prototype, 'findMany').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new TransactionService();
            const result = await service.getTransactionsByAccount(3);

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });

    describe('countTransactionsByAccount', () => {
        it('returns count when repository succeeds', async () => {
            const countSpy = jest.spyOn(TransactionRepository.prototype, 'count').mockResolvedValue(4);

            const service = new TransactionService();
            const result = await service.countTransactionsByAccount(3);

            expect(countSpy).toHaveBeenCalledWith({ accountId: { operator: Operator.EQUAL, value: 3 } });
            expect(result).toEqual({ success: true, data: 4 });
        });

        it('returns internal server error when repository throws', async () => {
            jest.spyOn(TransactionRepository.prototype, 'count').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new TransactionService();
            const result = await service.countTransactionsByAccount(3);

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });

    describe('getTransactionsByUser', () => {
        it('returns account not found when user has no accounts', async () => {
            const accountsSpy = jest.spyOn(AccountService.prototype, 'getAccountsByUser').mockResolvedValue({
                success: false,
                error: Resource.ACCOUNT_NOT_FOUND,
            });
            const findManySpy = jest.spyOn(TransactionRepository.prototype, 'findMany');

            const service = new TransactionService();
            const result = await service.getTransactionsByUser(8);

            expect(accountsSpy).toHaveBeenCalledWith(8);
            expect(findManySpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.ACCOUNT_NOT_FOUND });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.ACCOUNT_NOT_FOUND);
                expect(translate(result.error)).toBe(translate(Resource.ACCOUNT_NOT_FOUND));
            }
        });

        it('returns grouped transactions when repository succeeds', async () => {
            jest.spyOn(AccountService.prototype, 'getAccountsByUser').mockResolvedValue({
                success: true,
                data: [makeAccount({ id: 1 }), makeAccount({ id: 2 })],
            });
            const transactions = [
                makeTransaction({ id: 1, accountId: 1 }),
                makeTransaction({ id: 2, accountId: 2 }),
            ];
            const findManySpy = jest.spyOn(TransactionRepository.prototype, 'findMany').mockResolvedValue(transactions);

            const service = new TransactionService();
            const result = await service.getTransactionsByUser(8, { limit: 5, offset: 0, sort: 'date', order: Operator.ASC });

            expect(findManySpy).toHaveBeenCalledWith(
                { accountId: { operator: Operator.IN, value: [1, 2] } },
                { limit: 5, offset: 0, sort: 'date', order: 'asc' }
            );
            expect(result).toEqual({
                success: true,
                data: [
                    { accountId: 1, transactions: [transactions[0]] },
                    { accountId: 2, transactions: [transactions[1]] },
                ],
            });
        });

        it('returns internal server error when repository throws', async () => {
            jest.spyOn(AccountService.prototype, 'getAccountsByUser').mockResolvedValue({
                success: true,
                data: [makeAccount({ id: 1 })],
            });
            jest.spyOn(TransactionRepository.prototype, 'findMany').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new TransactionService();
            const result = await service.getTransactionsByUser(8);

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });

    describe('countTransactionsByUser', () => {
        it('returns account not found when user has no accounts', async () => {
            jest.spyOn(AccountService.prototype, 'getAccountsByUser').mockResolvedValue({
                success: true,
                data: [],
            });
            const countSpy = jest.spyOn(TransactionRepository.prototype, 'count');

            const service = new TransactionService();
            const result = await service.countTransactionsByUser(9);

            expect(countSpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.ACCOUNT_NOT_FOUND });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.ACCOUNT_NOT_FOUND);
                expect(translate(result.error)).toBe(translate(Resource.ACCOUNT_NOT_FOUND));
            }
        });

        it('returns count when repository succeeds', async () => {
            jest.spyOn(AccountService.prototype, 'getAccountsByUser').mockResolvedValue({
                success: true,
                data: [makeAccount({ id: 3 }), makeAccount({ id: 4 })],
            });
            const countSpy = jest.spyOn(TransactionRepository.prototype, 'count').mockResolvedValue(6);

            const service = new TransactionService();
            const result = await service.countTransactionsByUser(9);

            expect(countSpy).toHaveBeenCalledWith({ accountId: { operator: Operator.IN, value: [3, 4] } });
            expect(result).toEqual({ success: true, data: 6 });
        });

        it('returns internal server error when repository throws', async () => {
            jest.spyOn(AccountService.prototype, 'getAccountsByUser').mockResolvedValue({
                success: true,
                data: [makeAccount({ id: 3 })],
            });
            jest.spyOn(TransactionRepository.prototype, 'count').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new TransactionService();
            const result = await service.countTransactionsByUser(9);

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });

    describe('updateTransaction', () => {
        it('returns transaction not found when current transaction is missing', async () => {
            const findSpy = jest.spyOn(TransactionRepository.prototype, 'findById').mockResolvedValue(null);
            const updateSpy = jest.spyOn(TransactionRepository.prototype, 'update');

            const service = new TransactionService();
            const result = await service.updateTransaction(10, { value: '200' });

            expect(findSpy).toHaveBeenCalledWith(10);
            expect(updateSpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.TRANSACTION_NOT_FOUND });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.TRANSACTION_NOT_FOUND);
                expect(translate(result.error)).toBe(translate(Resource.TRANSACTION_NOT_FOUND));
            }
        });

        it('returns account not found when account source is invalid', async () => {
            const current = makeTransaction({ id: 11, transactionSource: TransactionSource.ACCOUNT, accountId: 1, categoryId: 1 });
            jest.spyOn(TransactionRepository.prototype, 'findById').mockResolvedValue(current);
            jest.spyOn(AccountService.prototype, 'getAccountById').mockResolvedValue({
                success: false,
                error: Resource.ACCOUNT_NOT_FOUND,
            });
            const updateSpy = jest.spyOn(TransactionRepository.prototype, 'update');

            const service = new TransactionService();
            const result = await service.updateTransaction(11, { accountId: 99, transactionSource: TransactionSource.ACCOUNT });

            expect(updateSpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.ACCOUNT_NOT_FOUND });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.ACCOUNT_NOT_FOUND);
                expect(translate(result.error)).toBe(translate(Resource.ACCOUNT_NOT_FOUND));
            }
        });

        it('returns credit card not found when credit card source is invalid', async () => {
            const current = makeTransaction({ id: 12, transactionSource: TransactionSource.CREDIT_CARD, creditCardId: 3, categoryId: 1 });
            jest.spyOn(TransactionRepository.prototype, 'findById').mockResolvedValue(current);
            jest.spyOn(CreditCardService.prototype, 'getCreditCardById').mockResolvedValue({
                success: false,
                error: Resource.CREDIT_CARD_NOT_FOUND,
            });
            const updateSpy = jest.spyOn(TransactionRepository.prototype, 'update');

            const service = new TransactionService();
            const result = await service.updateTransaction(12, { creditCardId: 99, transactionSource: TransactionSource.CREDIT_CARD });

            expect(updateSpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.CREDIT_CARD_NOT_FOUND });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.CREDIT_CARD_NOT_FOUND);
                expect(translate(result.error)).toBe(translate(Resource.CREDIT_CARD_NOT_FOUND));
            }
        });

        it('returns category or subcategory required when both are missing', async () => {
            const current = makeTransaction({ id: 13, categoryId: null, subcategoryId: null, transactionSource: TransactionSource.ACCOUNT, accountId: 1 });
            jest.spyOn(TransactionRepository.prototype, 'findById').mockResolvedValue(current);
            jest.spyOn(AccountService.prototype, 'getAccountById').mockResolvedValue({ success: true, data: makeAccount({ id: 1 }) });

            const service = new TransactionService();
            const result = await service.updateTransaction(13, { value: '100' });

            expect(result).toEqual({ success: false, error: Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED);
                expect(translate(result.error)).toBe(translate(Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED));
            }
        });

        it('returns category not found or inactive when category validation fails', async () => {
            const current = makeTransaction({ id: 14, transactionSource: TransactionSource.ACCOUNT, accountId: 1, categoryId: 1 });
            jest.spyOn(TransactionRepository.prototype, 'findById').mockResolvedValue(current);
            jest.spyOn(AccountService.prototype, 'getAccountById').mockResolvedValue({ success: true, data: makeAccount({ id: 1 }) });
            jest.spyOn(CategoryService.prototype, 'getCategoryById').mockResolvedValue({
                success: false,
                error: Resource.CATEGORY_NOT_FOUND_OR_INACTIVE,
            });

            const service = new TransactionService();
            const result = await service.updateTransaction(14, { categoryId: 99 });

            expect(result).toEqual({ success: false, error: Resource.CATEGORY_NOT_FOUND_OR_INACTIVE });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.CATEGORY_NOT_FOUND_OR_INACTIVE);
                expect(translate(result.error)).toBe(translate(Resource.CATEGORY_NOT_FOUND_OR_INACTIVE));
            }
        });

        it('returns subcategory not found or inactive when subcategory validation fails', async () => {
            const current = makeTransaction({ id: 15, transactionSource: TransactionSource.ACCOUNT, accountId: 1, categoryId: 1 });
            jest.spyOn(TransactionRepository.prototype, 'findById').mockResolvedValue(current);
            jest.spyOn(AccountService.prototype, 'getAccountById').mockResolvedValue({ success: true, data: makeAccount({ id: 1 }) });
            jest.spyOn(SubcategoryService.prototype, 'getSubcategoryById').mockResolvedValue({
                success: false,
                error: Resource.SUBCATEGORY_NOT_FOUND_OR_INACTIVE,
            });

            const service = new TransactionService();
            const result = await service.updateTransaction(15, { subcategoryId: 7 });

            expect(result).toEqual({ success: false, error: Resource.SUBCATEGORY_NOT_FOUND_OR_INACTIVE });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.SUBCATEGORY_NOT_FOUND_OR_INACTIVE);
                expect(translate(result.error)).toBe(translate(Resource.SUBCATEGORY_NOT_FOUND_OR_INACTIVE));
            }
        });

        it('updates and clears credit card when account source is used', async () => {
            const current = makeTransaction({ id: 16, transactionSource: TransactionSource.ACCOUNT, accountId: 2, categoryId: 1 });
            jest.spyOn(TransactionRepository.prototype, 'findById').mockResolvedValue(current);
            jest.spyOn(AccountService.prototype, 'getAccountById').mockResolvedValue({ success: true, data: makeAccount({ id: 2 }) });
            jest.spyOn(CategoryService.prototype, 'getCategoryById').mockResolvedValue({ success: true, data: makeCategory({ id: current.categoryId ?? 1, active: true }) });
            const updated = makeTransaction({ id: 16, accountId: 2, creditCardId: null });
            const updateSpy = jest.spyOn(TransactionRepository.prototype, 'update').mockResolvedValue(updated);

            const service = new TransactionService();
            const result = await service.updateTransaction(16, { creditCardId: 55, accountId: 2, categoryId: current.categoryId ?? 1 });

            expect(updateSpy).toHaveBeenCalledWith(16, expect.objectContaining({ creditCardId: null, accountId: 2, categoryId: current.categoryId ?? 1 }), expect.anything());
            expect(result).toEqual({ success: true, data: updated });
        });

        it('updates account balance when transaction value changes', async () => {
            const current = makeTransaction({ id: 30, transactionSource: TransactionSource.ACCOUNT, accountId: 5, categoryId: 1, value: '100' });
            const updated = makeTransaction({ id: 30, transactionSource: TransactionSource.ACCOUNT, accountId: 5, categoryId: 1, value: '150' });
            jest.spyOn(TransactionRepository.prototype, 'findById').mockResolvedValue(current);
            jest.spyOn(AccountService.prototype, 'getAccountById').mockResolvedValue({ success: true, data: makeAccount({ id: 5 }) });
            jest.spyOn(CategoryService.prototype, 'getCategoryById').mockResolvedValue({ success: true, data: makeCategory({ id: 1, active: true }) });
            jest.spyOn(TransactionRepository.prototype, 'update').mockResolvedValue(updated);
            const accountRow = makeAccount({ id: 5, balance: '500.00' });
            jest.spyOn(AccountRepository.prototype, 'findById').mockResolvedValue(accountRow);
            const balanceSpy = jest.spyOn(AccountRepository.prototype, 'update').mockResolvedValue(accountRow);

            const service = new TransactionService();
            const result = await service.updateTransaction(30, { value: '150', accountId: 5, categoryId: 1 });

            expect(balanceSpy).toHaveBeenCalledWith(5, { balance: '450.00' }, expect.anything());
            expect(result).toEqual({ success: true, data: updated });
        });

        it('updates and clears account when credit card source is used', async () => {
            const current = makeTransaction({ id: 17, transactionSource: TransactionSource.CREDIT_CARD, creditCardId: 9, categoryId: 1 });
            jest.spyOn(TransactionRepository.prototype, 'findById').mockResolvedValue(current);
            jest.spyOn(CreditCardService.prototype, 'getCreditCardById').mockResolvedValue({ success: true, data: makeCreditCard({ id: 9 }) });
            jest.spyOn(CategoryService.prototype, 'getCategoryById').mockResolvedValue({ success: true, data: makeCategory({ id: current.categoryId ?? 1, active: true }) });
            const updated = makeTransaction({ id: 17, creditCardId: 9, accountId: null, transactionSource: TransactionSource.CREDIT_CARD });
            const updateSpy = jest.spyOn(TransactionRepository.prototype, 'update').mockResolvedValue(updated);

            const service = new TransactionService();
            const result = await service.updateTransaction(17, { accountId: 3, transactionSource: TransactionSource.CREDIT_CARD, categoryId: current.categoryId ?? 1 });

            expect(updateSpy).toHaveBeenCalledWith(17, expect.objectContaining({ accountId: null, transactionSource: TransactionSource.CREDIT_CARD, categoryId: current.categoryId ?? 1 }), expect.anything());
            expect(result).toEqual({ success: true, data: updated });
        });

        it('returns internal server error when repository update throws', async () => {
            const current = makeTransaction({ id: 18, transactionSource: TransactionSource.ACCOUNT, accountId: 2, categoryId: 1 });
            jest.spyOn(TransactionRepository.prototype, 'findById').mockResolvedValue(current);
            jest.spyOn(AccountService.prototype, 'getAccountById').mockResolvedValue({ success: true, data: makeAccount({ id: 2 }) });
            jest.spyOn(CategoryService.prototype, 'getCategoryById').mockResolvedValue({ success: true, data: makeCategory({ id: current.categoryId ?? 1, active: true }) });
            jest.spyOn(TransactionRepository.prototype, 'update').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new TransactionService();
            const result = await service.updateTransaction(18, { accountId: 2, categoryId: current.categoryId ?? 1 });

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });

    describe('deleteTransaction', () => {
        it('returns transaction not found when repository returns null', async () => {
            const findSpy = jest.spyOn(TransactionRepository.prototype, 'findById').mockResolvedValue(null);
            const deleteSpy = jest.spyOn(TransactionRepository.prototype, 'delete');

            const service = new TransactionService();
            const result = await service.deleteTransaction(20);

            expect(findSpy).toHaveBeenCalledWith(20);
            expect(deleteSpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.TRANSACTION_NOT_FOUND });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.TRANSACTION_NOT_FOUND);
                expect(translate(result.error)).toBe(translate(Resource.TRANSACTION_NOT_FOUND));
            }
        });

        it('deletes and returns id when transaction exists', async () => {
            const transaction = makeTransaction({ id: 21 });
            jest.spyOn(TransactionRepository.prototype, 'findById').mockResolvedValue(transaction);
            const deleteSpy = jest.spyOn(TransactionRepository.prototype, 'delete').mockResolvedValue();
            const accountRow = makeAccount({ id: transaction.accountId ?? 1, balance: '300.00' });
            jest.spyOn(AccountRepository.prototype, 'findById').mockResolvedValue(accountRow);
            const balanceSpy = jest.spyOn(AccountRepository.prototype, 'update').mockResolvedValue(accountRow);

            const service = new TransactionService();
            const result = await service.deleteTransaction(21);

            expect(deleteSpy).toHaveBeenCalledWith(21, expect.anything());
            expect(balanceSpy).toHaveBeenCalledWith(transaction.accountId ?? 1, { balance: '400.00' }, expect.anything());
            expect(result).toEqual({ success: true, data: { id: 21 } });
        });

        it('returns internal server error when repository delete throws', async () => {
            const transaction = makeTransaction({ id: 22 });
            jest.spyOn(TransactionRepository.prototype, 'findById').mockResolvedValue(transaction);
            jest.spyOn(TransactionRepository.prototype, 'delete').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new TransactionService();
            const result = await service.deleteTransaction(22);

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });
});
