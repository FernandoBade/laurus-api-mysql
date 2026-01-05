import { SelectUser, SelectAccount } from '../../src/db/schema';
import { AccountType, Currency, DateFormat, Language, Profile, Theme, TransactionType, TransactionSource } from '../../src/utils/enum';
import { SanitizedUser } from '../../src/service/userService';

/**
 * @summary Builds a complete SelectUser object with sensible defaults for tests.
 */
export function makeUser(overrides: Partial<SelectUser> = {}): SelectUser {
    const now = new Date('2024-01-01T00:00:00Z');

    return {
        id: overrides.id ?? 1,
        firstName: overrides.firstName ?? 'Test',
        lastName: overrides.lastName ?? 'User',
        email: overrides.email ?? 'testuser@example.com',
        password: overrides.password ?? 'hashed-password',
        birthDate: overrides.birthDate ?? now,
        phone: overrides.phone ?? '555-0100',
        avatarUrl: overrides.avatarUrl ?? null,
        theme: overrides.theme ?? Theme.DARK,
        language: overrides.language ?? Language.EN_US,
        dateFormat: overrides.dateFormat ?? DateFormat.DD_MM_YYYY,
        currency: overrides.currency ?? Currency.BRL,
        profile: overrides.profile ?? Profile.STARTER,
        hideValues: overrides.hideValues ?? false,
        active: overrides.active ?? true,
        createdAt: overrides.createdAt ?? now,
        updatedAt: overrides.updatedAt ?? now,
    };
}

/**
 * @summary Returns a sanitized user object without sensitive fields.
 */
export function makeSanitizedUser(overrides: Partial<SanitizedUser> = {}): SanitizedUser {
    const { password: _ignored, ...user } = makeUser(overrides);
    return user;
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
export function makeAccount(overrides: Partial<SelectAccount> = {}): SelectAccount {
    const now = new Date('2024-01-01T00:00:00Z');

    return {
        id: overrides.id ?? 1,
        name: overrides.name ?? 'Main Account',
        institution: overrides.institution ?? 'Test Bank',
        type: overrides.type ?? AccountType.CHECKING,
        observation: overrides.observation ?? null,
        balance: overrides.balance ?? '0.00',
        active: overrides.active ?? true,
        userId: overrides.userId ?? 1,
        createdAt: overrides.createdAt ?? now,
        updatedAt: overrides.updatedAt ?? now,
    };
}

/**
 * @summary Provides a valid payload for creating an account.
 */
export function makeAccountInput(overrides: Partial<{ name: string; institution: string; type: AccountType; observation?: string; balance?: number; userId: number; active?: boolean }> = {}) {
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
        value: number;
        date: Date;
        categoryId?: number;
        subcategoryId?: number;
        observation?: string;
        transactionType?: any;
        transactionSource?: any;
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
        value: overrides.value ?? 100,
        date: overrides.date ?? new Date('2024-01-01T00:00:00Z'),
        transactionType: overrides.transactionType ?? TransactionType.EXPENSE,
        transactionSource: overrides.transactionSource ?? TransactionSource.ACCOUNT,
        isInstallment: overrides.isInstallment ?? false,
        isRecurring: overrides.isRecurring ?? false,
        active: overrides.active ?? true,
    };

    // category_id is commonly required by tests; default to 1 when not provided to mirror prior factories
    body.category_id = overrides.categoryId ?? 1;
    if (overrides.subcategoryId !== undefined) body.subcategory_id = overrides.subcategoryId;
    if (overrides.observation !== undefined) body.observation = overrides.observation;
    if (overrides.totalMonths !== undefined) body.totalMonths = overrides.totalMonths;
    if (overrides.paymentDay !== undefined) body.paymentDay = overrides.paymentDay;
    if (overrides.accountId !== undefined) body.account_id = overrides.accountId;
    if (overrides.creditCardId !== undefined) body.creditCard_id = overrides.creditCardId;
    if (overrides.tags !== undefined) body.tags = overrides.tags;

    return body;
}

export function makeTransaction(
    overrides: Partial<{
        id: number;
        value: string;
        date: Date;
        categoryId?: number | null;
        subcategoryId?: number | null;
        observation?: string | null;
        transactionType?: any;
        transactionSource?: any;
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
) {
    const now = new Date('2024-01-01T00:00:00Z');

    return {
        id: overrides.id ?? 1,
        value: overrides.value ?? '100',
        date: overrides.date ?? now,
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
        createdAt: overrides.createdAt ?? now,
        updatedAt: overrides.updatedAt ?? now,
    };
}
