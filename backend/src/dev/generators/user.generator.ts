import UserController from '../../controller/userController';
import type { SanitizedUser } from '../../../../shared/domains/user/user.types';
import { Currency, DateFormat, Language, Profile, Theme } from '../../../../shared/enums';
import { SeedContext, SeedRegistry, executeController, randomDateBetween, slugify } from '../seed.utils';

type UserRequestBody = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    birthDate?: Date;
    theme?: Theme;
    language?: Language;
    currency?: Currency;
    dateFormat?: DateFormat;
    profile?: Profile;
    hideValues?: boolean;
    active?: boolean;
};

/**
 * Creates a new user using the UserController.
 *
 * @summary Generates and persists a user through the controller flow.
 */
export async function createUser(context: SeedContext, index: number): Promise<SanitizedUser> {
    const firstName = context.random.pickOne(context.config.firstNames);
    const lastName = context.random.pickOne(context.config.lastNames);
    const email = buildUniqueEmail(context.registry, firstName, lastName, index, context.config.emailDomain, context);
    const birthDate = buildBirthDate(context);
    const phone = buildPhoneNumber(context);

    const body: UserRequestBody = {
        firstName,
        lastName,
        email,
        password: context.config.defaultPassword,
        ...(phone ? { phone } : {}),
        ...(birthDate ? { birthDate } : {}),
        theme: context.random.pickOne(context.config.userOptions.themes),
        language: context.random.pickOne(context.config.userOptions.languages),
        currency: context.random.pickOne(context.config.userOptions.currencies),
        dateFormat: context.random.pickOne(context.config.userOptions.dateFormats),
        profile: context.random.pickOne(context.config.userOptions.profiles),
        hideValues: context.random.chance(context.config.userOptions.hideValuesChance),
        active: context.random.chance(context.config.userOptions.activeChance),
    };

    return executeController<SanitizedUser>(UserController.createUser, {
        body,
        language: context.language,
    });
}

/**
 * Builds a unique email address for seeded users.
 *
 * @summary Generates a realistic, unique email for the seed run.
 */
function buildUniqueEmail(
    registry: SeedRegistry,
    firstName: string,
    lastName: string,
    index: number,
    domain: string,
    context: SeedContext
): string {
    const base = `${slugify(firstName)}.${slugify(lastName)}`;
    const suffix = `${index + 1}${context.random.int(10, 99)}`;
    const email = `${base}.${suffix}@${domain}`;

    if (!registry.emails.has(email)) {
        registry.emails.add(email);
        return email;
    }

    for (let attempt = 0; attempt < 8; attempt += 1) {
        const retry = `${base}.${context.random.int(100, 999)}@${domain}`;
        if (!registry.emails.has(retry)) {
            registry.emails.add(retry);
            return retry;
        }
    }

    const fallback = `${base}.${Date.now()}@${domain}`;
    registry.emails.add(fallback);
    return fallback;
}

/**
 * Generates a realistic phone number for a Brazilian format.
 *
 * @summary Creates a phone number string when enabled by config.
 */
function buildPhoneNumber(context: SeedContext): string | undefined {
    if (!context.random.chance(context.config.userOptions.phoneChance)) {
        return undefined;
    }

    const area = context.random.pickOne(context.config.phoneAreaCodes);
    const prefix = context.random.int(90000, 99999);
    const suffix = context.random.int(1000, 9999);
    return `+55 ${area} ${prefix}-${suffix}`;
}

/**
 * Generates a birth date within a realistic adult age range.
 *
 * @summary Creates birth dates for seeded users.
 */
function buildBirthDate(context: SeedContext): Date | undefined {
    if (!context.random.chance(context.config.userOptions.birthDateChance)) {
        return undefined;
    }

    const now = new Date();
    const start = new Date(now.getFullYear() - 65, 0, 1);
    const end = new Date(now.getFullYear() - 18, 11, 31);
    return randomDateBetween(context.random, start, end);
}
