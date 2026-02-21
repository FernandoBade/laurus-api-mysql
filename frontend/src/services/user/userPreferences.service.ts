import type { UserId } from "@shared/domains/user/user.types";
import { Currency, Language } from "@shared/enums/user.enums";
import { getUserById } from "@/api/users/users.api";

export interface UserPreferencesSnapshot {
    readonly language: Language;
    readonly currency: Currency;
}

/**
 * @summary Returns whether language.
 */
function isLanguage(value: unknown): value is Language {
    return value === Language.EN_US || value === Language.ES_ES || value === Language.PT_BR;
}

/**
 * @summary Returns whether currency.
 */
function isCurrency(value: unknown): value is Currency {
    return (
        value === Currency.ARS
        || value === Currency.BRL
        || value === Currency.COP
        || value === Currency.EUR
        || value === Currency.USD
    );
}

/**
 * @summary Resolves language and currency preferences for an authenticated user.
 * @param userId User identifier to query in backend.
 * @returns Typed preference snapshot or null when unavailable.
 */
export async function fetchUserPreferences(userId: UserId): Promise<UserPreferencesSnapshot | null> {
    const response = await getUserById(userId);
    const language = response.data?.language;
    const currency = response.data?.currency;

    if (!response.success || !isLanguage(language) || !isCurrency(currency)) {
        return null;
    }

    return {
        language,
        currency,
    };
}
