import { translateResource } from "@shared/i18n/resource.utils";
import type { ResourceKey } from "@shared/i18n/resource.keys";
import { getLocale } from "@/state/locale.store";

/**
 * @summary Resolves a required translation key using the current locale dictionary.
 * @param key Resource key to resolve.
 * @returns Localized string for the active locale.
 */

export function t(key: ResourceKey): string {
    return translateResource(key, getLocale());
}

/**
 * @summary Resolves an optional translation key and returns undefined when absent.
 * @param key Optional resource key.
 * @returns Localized string or undefined.
 */

export function tOptional(key?: ResourceKey): string | undefined {
    return key ? t(key) : undefined;
}
