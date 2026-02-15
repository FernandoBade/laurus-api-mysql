import { translateResource } from "@shared/i18n/resource.utils";
import type { ResourceKey } from "@shared/i18n/resource.keys";
import { getLocale } from "@/state/locale.store";

/**
 * @summary Translates a shared ResourceKey using the locale from frontend state.
 * IMPORTANTE: this thin adapter only injects runtime locale and does not duplicate any i18n logic or message tables.
 * @param key Resource key to resolve.
 * @returns Localized string for the active locale.
 */
export function t(key: ResourceKey): string {
    return translateResource(key, getLocale());
}

/**
 * @summary Translates a key only when provided.
 * @param key Optional resource key.
 * @returns Localized string or undefined.
 */
export function tOptional(key?: ResourceKey): string | undefined {
    return key ? t(key) : undefined;
}
