import {
    validateCreateUser,
    validateUpdateUser,
    validateCreateAccount,
    validateUpdateAccount,
    validateCreateCategory,
    validateUpdateCategory,
    validateCreateSubcategory,
    validateUpdateSubcategory,
    validateCreateCreditCard,
    validateUpdateCreditCard,
    validateCreateTransaction,
    validateUpdateTransaction,
} from '../../../src/utils/validation/validateRequest';
import { createValidationError } from '../../../src/utils/validation/errors';
import {
    isString,
    isNumber,
    isBoolean,
    isDate,
    isEnum,
    isValidEmail,
    hasMinLength,
} from '../../../src/utils/validation/guards';
import { ResourceBase } from '../../../src/utils/resources/languages/resourceService';
import { Resource } from '../../../src/utils/resources/resource';
import {
    AccountType,
    CategoryColor,
    CategoryType,
    CreditCardFlag,
    Currency,
    DateFormat,
    Language,
    Profile,
    Theme,
    TransactionSource,
    TransactionType,
} from '../../../src/utils/enum';

const lang = 'en-US' as const;
const t = (resource: Resource) => ResourceBase.translate(resource, lang);

describe('validation errors', () => {
    it('creates validation error objects', () => {
        expect(createValidationError('field', 'error')).toEqual({ property: 'field', error: 'error' });
    });
});

describe('validation guards', () => {
    it('validates strings', () => {
        expect(isString('ok')).toBe(true);
        expect(isString('')).toBe(false);
        expect(isString(1)).toBe(false);
    });

    it('validates numbers', () => {
        expect(isNumber(1)).toBe(true);
        expect(isNumber(NaN)).toBe(false);
        expect(isNumber('1')).toBe(false);
    });

    it('validates booleans', () => {
        expect(isBoolean(true)).toBe(true);
        expect(isBoolean(false)).toBe(true);
        expect(isBoolean('true')).toBe(false);
    });

    it('validates dates', () => {
        expect(isDate(new Date('2024-01-01'))).toBe(true);
        expect(isDate('2024-01-01')).toBe(true);
        expect(isDate('invalid')).toBe(false);
        expect(isDate(1)).toBe(false);
    });

    it('validates enum membership', () => {
        expect(isEnum(CategoryType.EXPENSE, CategoryType)).toBe(true);
        expect(isEnum('invalid', CategoryType)).toBe(false);
    });

    it('validates email format', () => {
        expect(isValidEmail('user@example.com')).toBe(true);
        expect(isValidEmail('invalid')).toBe(false);
    });

    it('validates minimum length', () => {
        expect(hasMinLength('abcd', 3)).toBe(true);
        expect(hasMinLength('a', 2)).toBe(false);
    });
});

describe('validateRequest', () => {
    describe('validateCreateUser', () => {
        it('returns errors for invalid input', () => {
            const result = validateCreateUser(
                { firstName: 'A', lastName: 'Doe', email: 'user@example.com', password: '123456' },
                lang
            );

            expect(result.success).toBe(false);
            if (result.success) return;
            expect(result.errors).toEqual([
                createValidationError('firstName', t(Resource.FIRST_NAME_TOO_SHORT)),
            ]);
        });

        it('returns normalized data for valid input', () => {
            const result = validateCreateUser(
                {
                    firstName: 'Ana',
                    lastName: 'Silva',
                    email: 'TEST@EXAMPLE.COM',
                    password: '123456',
                    phone: '123',
                    birthDate: '1990-01-01',
                    theme: Theme.DARK,
                    language: Language.EN_US,
                    currency: Currency.BRL,
                    dateFormat: DateFormat.DD_MM_YYYY,
                    profile: Profile.STARTER,
                    active: true,
                },
                lang
            );

            expect(result.success).toBe(true);
            if (!result.success) return;
            expect(result.data.email).toBe('test@example.com');
            expect(result.data.birthDate).toBeInstanceOf(Date);
            expect(result.data.theme).toBe(Theme.DARK);
            expect(result.data.active).toBe(true);
        });
    });

    describe('validateUpdateUser', () => {
        it('returns errors for invalid input', () => {
            const result = validateUpdateUser({ email: 'invalid' }, lang);

            expect(result.success).toBe(false);
            if (result.success) return;
            expect(result.errors).toEqual([createValidationError('email', t(Resource.EMAIL_INVALID))]);
        });

        it('returns normalized data for valid input', () => {
            const result = validateUpdateUser({ email: 'TEST@EXAMPLE.COM', active: true }, lang);

            expect(result.success).toBe(true);
            if (!result.success) return;
            expect(result.data.email).toBe('test@example.com');
            expect(result.data.active).toBe(true);
        });
    });

    describe('validateCreateAccount', () => {
        it('returns errors for invalid input', () => {
            const result = validateCreateAccount(
                { name: 'Main', institution: 'Bank', type: AccountType.CHECKING, user_id: 0 },
                lang
            );

            expect(result.success).toBe(false);
            if (result.success) return;
            expect(result.errors).toEqual([createValidationError('user_id', t(Resource.VALIDATION_ERROR))]);
        });

        it('returns normalized data for valid input', () => {
            const result = validateCreateAccount(
                {
                    name: 'Main',
                    institution: 'Bank',
                    type: AccountType.CHECKING,
                    observation: 'note',
                    user_id: 2,
                    active: true,
                },
                lang
            );

            expect(result.success).toBe(true);
            if (!result.success) return;
            expect(result.data.userId).toBe(2);
            expect(result.data.observation).toBe('note');
            expect(result.data.active).toBe(true);
        });
    });

    describe('validateUpdateAccount', () => {
        it('returns errors for invalid input', () => {
            const result = validateUpdateAccount({ user_id: 0 }, lang);

            expect(result.success).toBe(false);
            if (result.success) return;
            expect(result.errors).toEqual([createValidationError('user_id', t(Resource.VALIDATION_ERROR))]);
        });

        it('returns normalized data for valid input', () => {
            const result = validateUpdateAccount({ name: 'New', observation: 'note', active: false }, lang);

            expect(result.success).toBe(true);
            if (!result.success) return;
            expect(result.data.name).toBe('New');
            expect(result.data.observation).toBe('note');
            expect(result.data.active).toBe(false);
        });
    });

    describe('validateCreateCategory', () => {
        it('returns errors for invalid input', () => {
            const result = validateCreateCategory(
                { name: 'Food', type: 'invalid', user_id: 1 },
                lang
            );

            expect(result.success).toBe(false);
            if (result.success) return;
            expect(result.errors).toEqual([createValidationError('type', t(Resource.INVALID_ENUM))]);
        });

        it('returns normalized data for valid input', () => {
            const result = validateCreateCategory(
                {
                    name: 'Food',
                    type: CategoryType.EXPENSE,
                    color: CategoryColor.BLUE,
                    user_id: 1,
                    active: true,
                },
                lang
            );

            expect(result.success).toBe(true);
            if (!result.success) return;
            expect(result.data.userId).toBe(1);
            expect(result.data.color).toBe(CategoryColor.BLUE);
            expect(result.data.active).toBe(true);
        });
    });

    describe('validateUpdateCategory', () => {
        it('returns errors for invalid input', () => {
            const result = validateUpdateCategory({ user_id: -1 }, lang);

            expect(result.success).toBe(false);
            if (result.success) return;
            expect(result.errors).toEqual([createValidationError('user_id', t(Resource.VALIDATION_ERROR))]);
        });

        it('returns normalized data for valid input', () => {
            const result = validateUpdateCategory(
                {
                    name: 'Salary',
                    type: CategoryType.INCOME,
                    color: CategoryColor.GREEN,
                    active: false,
                },
                lang
            );

            expect(result.success).toBe(true);
            if (!result.success) return;
            expect(result.data.name).toBe('Salary');
            expect(result.data.type).toBe(CategoryType.INCOME);
            expect(result.data.color).toBe(CategoryColor.GREEN);
            expect(result.data.active).toBe(false);
        });
    });

    describe('validateCreateSubcategory', () => {
        it('returns errors for invalid input', () => {
            const result = validateCreateSubcategory({ name: 'Sub', category_id: 0 }, lang);

            expect(result.success).toBe(false);
            if (result.success) return;
            expect(result.errors).toEqual([createValidationError('category_id', t(Resource.VALIDATION_ERROR))]);
        });

        it('returns normalized data for valid input', () => {
            const result = validateCreateSubcategory({ name: 'Sub', category_id: 2, active: true }, lang);

            expect(result.success).toBe(true);
            if (!result.success) return;
            expect(result.data.categoryId).toBe(2);
            expect(result.data.active).toBe(true);
        });
    });

    describe('validateUpdateSubcategory', () => {
        it('returns errors for invalid input', () => {
            const result = validateUpdateSubcategory({ active: 'yes' }, lang);

            expect(result.success).toBe(false);
            if (result.success) return;
            expect(result.errors).toEqual([createValidationError('active', t(Resource.INVALID_TYPE))]);
        });

        it('returns normalized data for valid input', () => {
            const result = validateUpdateSubcategory({ name: 'New', category_id: 3 }, lang);

            expect(result.success).toBe(true);
            if (!result.success) return;
            expect(result.data.name).toBe('New');
            expect(result.data.categoryId).toBe(3);
        });
    });

    describe('validateCreateCreditCard', () => {
        it('returns errors for invalid input', () => {
            const result = validateCreateCreditCard({ name: 'Card', flag: 'invalid', user_id: 1 }, lang);

            expect(result.success).toBe(false);
            if (result.success) return;
            expect(result.errors).toEqual([createValidationError('flag', t(Resource.INVALID_ENUM))]);
        });

        it('returns normalized data for valid input', () => {
            const result = validateCreateCreditCard(
                {
                    name: 'Card',
                    flag: CreditCardFlag.VISA,
                    observation: 'note',
                    user_id: 1,
                    account_id: 5,
                    active: true,
                },
                lang
            );

            expect(result.success).toBe(true);
            if (!result.success) return;
            expect(result.data.userId).toBe(1);
            expect(result.data.accountId).toBe(5);
            expect(result.data.active).toBe(true);
        });
    });

    describe('validateUpdateCreditCard', () => {
        it('returns errors for invalid input', () => {
            const result = validateUpdateCreditCard({ account_id: 0 }, lang);

            expect(result.success).toBe(false);
            if (result.success) return;
            expect(result.errors).toEqual([createValidationError('account_id', t(Resource.VALIDATION_ERROR))]);
        });

        it('returns normalized data for valid input', () => {
            const result = validateUpdateCreditCard({ name: 'New', flag: CreditCardFlag.AMEX, account_id: 2 }, lang);

            expect(result.success).toBe(true);
            if (!result.success) return;
            expect(result.data.name).toBe('New');
            expect(result.data.flag).toBe(CreditCardFlag.AMEX);
            expect(result.data.accountId).toBe(2);
        });
    });

    describe('validateCreateTransaction', () => {
        it('returns errors when category and subcategory are missing', () => {
            const result = validateCreateTransaction(
                {
                    value: 10,
                    date: new Date(),
                    transactionType: TransactionType.EXPENSE,
                    transactionSource: TransactionSource.ACCOUNT,
                    isInstallment: false,
                    isRecurring: false,
                    account_id: 1,
                },
                lang
            );

            expect(result.success).toBe(false);
            if (result.success) return;
            expect(result.errors).toEqual(
                expect.arrayContaining([
                    createValidationError('category_id', t(Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED)),
                    createValidationError('subcategory_id', t(Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED)),
                ])
            );
        });

        it('returns errors when totalMonths is missing for installments', () => {
            const result = validateCreateTransaction(
                {
                    value: 10,
                    date: new Date(),
                    category_id: 1,
                    transactionType: TransactionType.EXPENSE,
                    transactionSource: TransactionSource.ACCOUNT,
                    isInstallment: true,
                    isRecurring: false,
                    account_id: 1,
                },
                lang
            );

            expect(result.success).toBe(false);
            if (result.success) return;
            expect(result.errors).toEqual([createValidationError('totalMonths', t(Resource.TOTAL_MONTHS_REQUIRED))]);
        });

        it('returns normalized data for valid input', () => {
            const result = validateCreateTransaction(
                {
                    value: 25,
                    date: '2024-01-01',
                    category_id: 2,
                    observation: 'note',
                    transactionType: TransactionType.INCOME,
                    transactionSource: TransactionSource.ACCOUNT,
                    isInstallment: false,
                    isRecurring: false,
                    account_id: 2,
                    active: true,
                },
                lang
            );

            expect(result.success).toBe(true);
            if (!result.success) return;
            expect(result.data.date).toBeInstanceOf(Date);
            expect(result.data.categoryId).toBe(2);
            expect(result.data.accountId).toBe(2);
            expect(result.data.active).toBe(true);
        });
    });

    describe('validateUpdateTransaction', () => {
        it('returns errors for invalid input', () => {
            const result = validateUpdateTransaction({ paymentDay: 40 }, lang);

            expect(result.success).toBe(false);
            if (result.success) return;
            expect(result.errors).toEqual([createValidationError('paymentDay', t(Resource.PAYMENT_DAY_OUT_OF_RANGE))]);
        });

        it('returns normalized data for valid input', () => {
            const result = validateUpdateTransaction(
                {
                    transactionSource: TransactionSource.CREDIT_CARD,
                    creditCard_id: 5,
                    date: '2024-01-01',
                    isInstallment: false,
                    isRecurring: false,
                },
                lang
            );

            expect(result.success).toBe(true);
            if (!result.success) return;
            expect(result.data.transactionSource).toBe(TransactionSource.CREDIT_CARD);
            expect(result.data.creditCardId).toBe(5);
            expect(result.data.date).toBeInstanceOf(Date);
            expect(result.data.isInstallment).toBe(false);
            expect(result.data.isRecurring).toBe(false);
        });
    });
});
