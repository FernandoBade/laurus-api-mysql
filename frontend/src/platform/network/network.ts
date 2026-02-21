type OnlineChangeCallback = (isCurrentlyOnline: boolean) => void;

/**
 * @summary Returns current browser network connectivity status.
 * @returns True when browser reports online, otherwise false.
 */

export function isOnline(): boolean {
    if (typeof navigator === "undefined") {
        return true;
    }

    return navigator.onLine;
}

/**
 * @summary Subscribes to browser connectivity changes and emits online state updates.
 * @param callback Handler invoked with the latest connectivity status.
 * @returns Unsubscribe function that removes event listeners.
 */

export function onOnlineChange(callback: OnlineChangeCallback): () => void {
    if (typeof window === "undefined") {
        return () => undefined;
    }

    const handleOnline = (): void => callback(true);
    const handleOffline = (): void => callback(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return (): void => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
    };
}
