import { AppRoutePath } from "@shared/enums/routes.enums";
import { navigate as navigateWithHistory } from "wouter-preact/use-browser-location";

/**
 * @summary Navigates to the given route by pushing a new history entry.
 * @param path Target typed route path.
 * @returns No return value.
 */
export function navigate(path: AppRoutePath): void {
  navigateWithHistory(path);
}

/**
 * @summary Navigates to the given route by replacing the current history entry.
 * @param path Target typed route path.
 * @returns No return value.
 */
export function replace(path: AppRoutePath): void {
  navigateWithHistory(path, { replace: true });
}
