import type { ToastItem, ToastPayload } from "@/types/ui/toast.types";

const DEFAULT_TOAST_DURATION_MS = 4000;

type ToastListener = (toasts: readonly ToastItem[]) => void;

const listeners = new Set<ToastListener>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

let toasts: ToastItem[] = [];


function notifyListeners(): void {
    const snapshot = [...toasts];
    listeners.forEach((listener) => listener(snapshot));
}


function clearTimer(id: string): void {
    const timer = timers.get(id);
    if (!timer) {
        return;
    }

    clearTimeout(timer);
    timers.delete(id);
}


function scheduleToastRemoval(item: ToastItem): void {
    const duration = item.durationMs ?? DEFAULT_TOAST_DURATION_MS;

    if (duration <= 0) {
        return;
    }

    const timer = setTimeout(() => {
        removeToast(item.id);
    }, duration);

    timers.set(item.id, timer);
}

/**
 * @summary Returns the current toast queue snapshot.
 * @returns Active toast list.
 */

export function getToasts(): readonly ToastItem[] {
    return [...toasts];
}

/**
 * @summary Appends a toast to the queue and schedules auto-dismiss when configured.
 * @param payload Toast payload.
 * @returns Generated toast identifier.
 */

export function pushToast(payload: ToastPayload): string {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const item: ToastItem = { id, ...payload };

    toasts = [...toasts, item];
    scheduleToastRemoval(item);
    notifyListeners();

    return id;
}

/**
 * @summary Removes a toast by id and clears its pending timer.
 * @param id Toast identifier.
 * @returns No return value.
 */

export function removeToast(id: string): void {
    clearTimer(id);
    toasts = toasts.filter((toast) => toast.id !== id);
    notifyListeners();
}

/**
 * @summary Clears all toasts and cancels their scheduled timers.
 * @returns No return value.
 */

export function clearToasts(): void {
    timers.forEach((timer) => clearTimeout(timer));
    timers.clear();
    toasts = [];
    notifyListeners();
}

/**
 * @summary Subscribes to toast queue state updates.
 * @param listener Listener called with the latest toast list.
 * @returns Unsubscribe callback.
 */

export function subscribeToasts(listener: ToastListener): () => void {
    listeners.add(listener);
    listener([...toasts]);

    return (): void => {
        listeners.delete(listener);
    };
}
