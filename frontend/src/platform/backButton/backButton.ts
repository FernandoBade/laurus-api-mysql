import type { BackButtonHandler } from "@/platform/backButton/backButton.types";

const handlers = new Set<BackButtonHandler>();

/**
 * @summary Subscribes a handler to back-button intents.
 * Web runtime is currently a no-op adapter for future native integration.
 * @param handler Callback for back-button handling.
 * @returns No return value.
 */
export function subscribe(handler: BackButtonHandler): void {
    handlers.add(handler);
}

/**
 * @summary Unsubscribes a back-button handler.
 * @param handler Callback to remove.
 * @returns No return value.
 */
export function unsubscribe(handler: BackButtonHandler): void {
    handlers.delete(handler);
}
