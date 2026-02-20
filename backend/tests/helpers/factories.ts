import { SelectUser, SelectAccount, SelectTransaction } from '../../src/db/schema';
import { AccountType } from '../../../shared/enums/account.enums';
import { TransactionType, TransactionSource } from '../../../shared/enums/transaction.enums';
import { Currency, Language, Profile, Theme } from '../../../shared/enums/user.enums';
import type { AccountEntity } from '../../../shared/domains/account/account.types';
import type { TransactionWithTags } from '../../../shared/domains/transaction/transaction.types';
import type { SanitizedUser, UserEntity } from '../../../shared/domains/user/user.types';
import type { ISODateString } from '../../../shared/types/format.types';

const DEFAULT_DATE = new Date('2024-01-01T00:00:00Z');
const DEFAULT_ISO_DATE = DEFAULT_DATE.toISOString();

const normalizeIsoDate = (value: ISODateString | Date | null | undefined, fallback: ISODateString | null): ISODateString | null => {
    if (value === undefined) {
        return fallback;
    }
    if (value === null) {
        return null;
    }
    return value instanceof Date ? value.toISOString() : value;
};

const normalizeRequiredIsoDate = (value: ISODateString | Date | undefined, fallback: ISODateString): ISODateString => {
    if (value === undefined) {
        return fallback;
    }
    return value instanceof Date ? value.toISOString() : value;
};

/**
 * @summary Builds a complete SelectUser object with sensible defaults for tests.
 */
export function makeDbUser(overrides: Partial<SelectUser> = {}): SelectUser {
    return {
        id: overrides.id ?? 1,
        firstName: overrides.firstName ?? 'Test',
        lastName: overrides.lastName ?? 'User',
        email: overrides.email ?? 'testuser@example.com',
        password: overrides.password ?? 'hashed-password',
        birthDate: overrides.birthDate ?? DEFAULT_DATE,
        phone: overrides.phone ?? '555-0100',
        avatarUrl: overrides.avatarUrl ?? null,
        theme: overrides.theme ?? Theme.DARK,
        language: overrides.language ?? Language.EN_US,
        currency: overrides.currency ?? Currency.BRL,
        profile: overrides.profile ?? Profile.STARTER,
        hideValues: overrides.hideValues ?? false,
        active: overrides.active ?? true,
        emailVerifiedAt: overrides.emailVerifiedAt !== undefined ? overrides.emailVerifiedAt : DEFAULT_DATE,
        createdAt: overrides.createdAt ?? DEFAULT_DATE,
        updatedAt: overrides.updatedAt ?? DEFAULT_DATE,
    };
}

/**
 * @summary Builds a full user entity using shared ISO string formats.
 */
export function makeUser(overrides: Partial<UserEntity> = {}): UserEntity {
    return {
        id: overrides.id ?? 1,
        firstName: overrides.firstName ?? 'Test',
        lastName: overrides.lastName ?? 'User',
        email: overrides.email ?? 'testuser@example.com',
        password: overrides.password ?? 'hashed-password',
        birthDate: normalizeIsoDate(overrides.birthDate, DEFAULT_ISO_DATE),
        phone: overrides.phone ?? '555-0100',
        avatarUrl: overrides.avatarUrl ?? null,
        theme: overrides.theme ?? Theme.DARK,
        language: overrides.language ?? Language.EN_US,
        currency: overrides.currency ?? Currency.BRL,
        profile: overrides.profile ?? Profile.STARTER,
        hideValues: overrides.hideValues ?? false,
        active: overrides.active ?? true,
        emailVerifiedAt: normalizeIsoDate(overrides.emailVerifiedAt, DEFAULT_ISO_DATE),
        createdAt: normalizeRequiredIsoDate(overrides.createdAt, DEFAULT_ISO_DATE),
        updatedAt: normalizeRequiredIsoDate(overrides.updatedAt, DEFAULT_ISO_DATE),
    };
}

/**
 * @summary Returns a sanitized user object without sensitive fields.
 */
export function makeSanitizedUser(overrides: Partial<SanitizedUser> = {}): SanitizedUser {
    const { password: _ignored, ...user } = makeUser(overrides as Partial<UserEntity>);
    void _ignored;
    return user as SanitizedUser;
}

/**
 * @summary Provides a valid payload for creating a new user.
 */
export function makeCreateUserInput(overrides: Partial<{ firstName: string; lastName: string; email: string; password: string; hideValues?: boolean }> = {}) {
    return {
        firstName: overrides.firstName ?? 'John',
        lastName: overrides.lastName ?? 'Doe',
        email: overrides.email ?? 'john.doe@example.com',
        password: overrides.password ?? 'password123',
        hideValues: overrides.hideValues,
    };
}

/**
 * @summary Builds a SelectAccount object ready for service/repository tests.
 */
export function makeDbAccount(overrides: Partial<SelectAccount> = {}): SelectAccount {
    return {
        id: overrides.id ?? 1,
        name: overrides.name ?? 'Main Account',
        institution: overrides.institution ?? 'Test Bank',
        type: overrides.type ?? AccountType.CHECKING,
        observation: overrides.observation ?? null,
        balance: overrides.balance ?? '0.00',
        active: overrides.active ?? true,
        userId: overrides.userId ?? 1,
        createdAt: overrides.createdAt ?? DEFAULT_DATE,
        updatedAt: overrides.updatedAt ?? DEFAULT_DATE,
    };
}

/**
 * @summary Builds an account entity formatted for API responses.
 */
export function makeAccount(overrides: Partial<AccountEntity> = {}): AccountEntity {
    return {
        id: overrides.id ?? 1,
        name: overrides.name ?? 'Main Account',
        institution: overrides.institution ?? 'Test Bank',
        type: overrides.type ?? AccountType.CHECKING,
        observation: overrides.observation ?? null,
        balance: overrides.balance ?? '0.00',
        active: overrides.active ?? true,
        userId: overrides.userId ?? 1,
        createdAt: normalizeRequiredIsoDate(overrides.createdAt, DEFAULT_ISO_DATE),
        updatedAt: normalizeRequiredIsoDate(overrides.updatedAt, DEFAULT_ISO_DATE),
    };
}

/**
 * @summary Provides a valid payload for creating an account.
 */
export function makeAccountInput(overrides: Partial<{ name: string; institution: string; type: AccountType; observation?: string; balance?: string; userId: number; active?: boolean }> = {}) {
    return {
        name: overrides.name ?? 'Wallet',
        institution: overrides.institution ?? 'Sample Bank',
        type: overrides.type ?? AccountType.CHECKING,
        observation: overrides.observation,
        balance: overrides.balance,
        userId: overrides.userId ?? 1,
        active: overrides.active ?? true,
    };
}

/**
 * Transaction factories
 *
 * Conventions:
 * - Factories that represent request payloads (inputs) SHOULD NOT include keys for optional fields when
 *   they are not provided (i.e., those fields are left undefined / omitted). This mirrors real HTTP
 *   requests where absent fields are not present and avoids triggering validators that check for null.
 * - Factories that represent database/select results (responses) SHOULD set optional fields explicitly to
 *   null when there is no value. This matches DB semantics where nullable columns are null rather than undefined
 *   and avoids TypeScript type mismatches (e.g., number | null expected).
 */

export function makeTransactionInput(
    overrides: Partial<{
        value: string;
        date: string;
        categoryId?: number;
        subcategoryId?: number;
        observation?: string;
        transactionType?: TransactionType;
        transactionSource?: TransactionSource;
        isInstallment?: boolean;
        totalMonths?: number;
        isRecurring?: boolean;
        paymentDay?: number;
        accountId?: number;
        creditCardId?: number;
        tags?: number[];
        active?: boolean;
    }> = {}
) {
    const body: Record<string, unknown> = {
        value: overrides.value ?? '100.00',
        date: overrides.date ?? DEFAULT_ISO_DATE,
        transactionType: overrides.transactionType ?? TransactionType.EXPENSE,
        transactionSource: overrides.transactionSource ?? TransactionSource.ACCOUNT,
        isInstallment: overrides.isInstallment ?? false,
        isRecurring: overrides.isRecurring ?? false,
        active: overrides.active ?? true,
    };

    // categoryId is commonly required by tests; default to 1 when not provided to mirror prior factories
    body.categoryId = overrides.categoryId ?? 1;
    if (overrides.subcategoryId !== undefined) body.subcategoryId = overrides.subcategoryId;
    if (overrides.observation !== undefined) body.observation = overrides.observation;
    if (overrides.totalMonths !== undefined) body.totalMonths = overrides.totalMonths;
    if (overrides.paymentDay !== undefined) body.paymentDay = overrides.paymentDay;
    if (overrides.accountId !== undefined) body.accountId = overrides.accountId;
    if (overrides.creditCardId !== undefined) body.creditCardId = overrides.creditCardId;
    if (overrides.tags !== undefined) body.tags = overrides.tags;

    return body;
}

export function makeDbTransaction(
    overrides: Partial<{
        id: number;
        value: string;
        date: Date;
        categoryId?: number | null;
        subcategoryId?: number | null;
        observation?: string | null;
        transactionType?: TransactionType;
        transactionSource?: TransactionSource;
        isInstallment?: boolean;
        totalMonths?: number | null;
        isRecurring?: boolean;
        paymentDay?: number | null;
        accountId?: number | null;
        creditCardId?: number | null;
        active?: boolean;
        createdAt?: Date;
        updatedAt?: Date;
    }> = {}
) : SelectTransaction {
    return {
        id: overrides.id ?? 1,
        value: overrides.value ?? '100',
        date: overrides.date ?? DEFAULT_DATE,
        categoryId: overrides.categoryId ?? 1,
        subcategoryId: overrides.subcategoryId ?? null,
        observation: overrides.observation ?? 'Groceries',
        transactionType: overrides.transactionType ?? TransactionType.EXPENSE,
        transactionSource: overrides.transactionSource ?? TransactionSource.ACCOUNT,
        isInstallment: overrides.isInstallment ?? false,
        totalMonths: overrides.totalMonths ?? null,
        isRecurring: overrides.isRecurring ?? false,
        paymentDay: overrides.paymentDay ?? null,
        accountId: overrides.accountId ?? 1,
        creditCardId: overrides.creditCardId ?? null,
        active: overrides.active ?? true,
        createdAt: overrides.createdAt ?? DEFAULT_DATE,
        updatedAt: overrides.updatedAt ?? DEFAULT_DATE,
    };
}

/**
 * @summary Builds a transaction response payload with ISO strings.
 */
export function makeTransaction(overrides: Partial<TransactionWithTags> = {}): TransactionWithTags {
    return {
        id: overrides.id ?? 1,
        value: overrides.value ?? '100.00',
        date: normalizeRequiredIsoDate(overrides.date, DEFAULT_ISO_DATE),
        transactionType: overrides.transactionType ?? TransactionType.EXPENSE,
        observation: overrides.observation ?? 'Groceries',
        transactionSource: overrides.transactionSource ?? TransactionSource.ACCOUNT,
        isInstallment: overrides.isInstallment ?? false,
        totalMonths: overrides.totalMonths ?? null,
        isRecurring: overrides.isRecurring ?? false,
        paymentDay: overrides.paymentDay ?? null,
        active: overrides.active ?? true,
        accountId: overrides.accountId ?? 1,
        creditCardId: overrides.creditCardId ?? null,
        categoryId: overrides.categoryId ?? 1,
        subcategoryId: overrides.subcategoryId ?? null,
        tags: overrides.tags ?? [],
        createdAt: normalizeRequiredIsoDate(overrides.createdAt, DEFAULT_ISO_DATE),
        updatedAt: normalizeRequiredIsoDate(overrides.updatedAt, DEFAULT_ISO_DATE),
    };
}
