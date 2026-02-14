import { ResourceKey } from "@shared/i18n/resource.keys";
import { initializeAuthService } from "@/services/auth/auth.service";
import { getLocale } from "@/state/locale.store";
import { initializeThemeStore } from "@/state/theme.store";
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

    initializeThemeStore();
    initializeAuthService();

    if (typeof document !== "undefined") {
        document.title = t(ResourceKey.APP_NAME);
        document.documentElement.setAttribute("lang", getLocale());
    }

    bootstrapped = true;
}
