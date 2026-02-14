import type { ToastItem, ToastPayload } from "@/types/ui/toast.types";

export type { ToastItem, ToastPayload };

/**
 * @summary Single toast render props.
 */
export interface ToastProps extends ToastPayload {
    readonly onClose?: () => void;
}

/**
 * @summary Toast list container props.
 */
export interface ToastContainerProps {
    readonly toasts: readonly ToastItem[];
    readonly onClose: (id: string) => void;
}
