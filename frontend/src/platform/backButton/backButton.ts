import type { BackButtonHandler } from "@/platform/backButton/backButton.types";

const handlers = new Set<BackButtonHandler>();

/**
 * @summary Registers a back-button handler in the platform event registry.
 * @param handler Callback for back-button handling.
 * @returns No return value.
 */

export function subscribe(handler: BackButtonHandler): void {
    handlers.add(handler);
}

/**
 * @summary Removes a previously registered back-button handler.
 * @param handler Callback to remove.
 * @returns No return value.
 */

export function unsubscribe(handler: BackButtonHandler): void {
    handlers.delete(handler);
}
