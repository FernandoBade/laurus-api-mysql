import { AppRoutePath } from "@shared/enums/routes.enums";
import { navigate as navigateWithHistory } from "wouter-preact/use-browser-location";

/**
 * NECESSARY DIFFERENCE: sandbox is a frontend-only debug route used for
 * UI validation and intentionally not part of backend/shared route contracts.
 */
export const SANDBOX_ROUTE_PATH = "/sandbox" as const;

type NavigationPath = AppRoutePath | typeof SANDBOX_ROUTE_PATH;

/**
 * @summary Navigates to the given route by pushing a new history entry.
 * @param path Target typed route path.
 * @returns No return value.
 */
export function navigate(path: NavigationPath): void {
  navigateWithHistory(path);
}

/**
 * @summary Navigates to the given route by replacing the current history entry.
 * @param path Target typed route path.
 * @returns No return value.
 */
export function replace(path: NavigationPath): void {
  navigateWithHistory(path, { replace: true });
}
