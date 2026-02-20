import { ResourceKey } from "@shared/i18n/resource.keys";
import { initializeAuthService } from "@/services/auth/auth.service";
import { initializeThemeStore } from "@/state/theme.store";
import { initializeUserPreferencesStore } from "@/state/userPreferences.store";
import { t } from "@/utils/i18n/translate";

let bootstrapped = false;

/**
 * @summary Initializes application runtime contracts before first render.
 * @returns No return value.
 */
export function bootstrapApp(): void {
    if (bootstrapped) {
        return;
    }

    initializeUserPreferencesStore();
    initializeThemeStore();
    initializeAuthService();

    if (typeof document !== "undefined") {
        document.title = t(ResourceKey.APP_NAME);
    }

    bootstrapped = true;
}
