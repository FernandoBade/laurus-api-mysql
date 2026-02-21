import { Currency, Language } from "@shared/enums/user.enums";

export interface PreferenceFactoryInput {
    readonly language: Language;
    readonly currency: Currency;
}

const DEFAULT_PREFERENCES: PreferenceFactoryInput = {
    language: Language.PT_BR,
    currency: Currency.USD,
};

/**
 * @summary Builds a deterministic preference object for tests.
 * @param overrides Partial preference overrides.
 * @returns Typed preferences object.
 */
export function makePreferences(
    overrides: Partial<PreferenceFactoryInput> = {}
): PreferenceFactoryInput {
    return {
        ...DEFAULT_PREFERENCES,
        ...overrides,
    };
}

/**
 * @summary Builds a persisted storage snapshot for user preferences.
 * @param overrides Partial preference overrides.
 * @returns Storage-compatible preferences snapshot.
 */
export function makeStorageSnapshot(
    overrides: Partial<PreferenceFactoryInput> = {}
): PreferenceFactoryInput {
    return makePreferences(overrides);
}

/**
 * @summary Builds backend preference payload used in reconciliation tests.
 * @param overrides Partial preference overrides.
 * @returns Backend-compatible preference payload.
 */
export function makeBackendPreferences(
    overrides: Partial<PreferenceFactoryInput> = {}
): PreferenceFactoryInput {
    return makePreferences(overrides);
}
