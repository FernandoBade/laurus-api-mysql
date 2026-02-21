import type { JSX } from "preact";
import { IconName } from "@shared/enums/icon.enums";
import { ButtonSize, ButtonVariant } from "@shared/enums/ui.enums";
import { Button } from "@/components/button/button";
import { Icon } from "@/components/icon/icon";
import { getStatusVariantClass } from "@/components/status/status-variant";
import type { ToastContainerProps, ToastProps } from "@/components/toast/toast.types";
import { classNames } from "@/utils/classNames";
import { t } from "@/utils/i18n/translate";

/**
 * @summary Renders a single toast notification with variant styling and dismiss action.
 * @param props Toast configuration.
 * @returns Toast component.
 */

export function Toast({ variant, message, icon, onClose }: ToastProps): JSX.Element {
    return (
        <div
            class={classNames(
                "alert relative w-full max-w-full items-start pr-12 font-ui shadow-lg sm:min-w-72 sm:max-w-md",
                getStatusVariantClass(variant)
            )}
        >
            {icon ? (
                <span class="mt-0.5 shrink-0">
                    <Icon name={icon} />
                </span>
            ) : null}
            <span class="min-w-0 break-words pr-1 text-body">{t(message)}</span>
            {onClose ? (
                <span class="absolute right-2 top-2 shrink-0">
                    <Button
                        variant={ButtonVariant.GHOST}
                        size={ButtonSize.SM}
                        iconLeft={IconName.CLOSE}
                        onClick={onClose}
                    />
                </span>
            ) : null}
        </div>
    );
}

/**
 * @summary Renders and stacks active toast notifications.
 * @param props Toast container configuration.
 * @returns Toast container component.
 */

export function ToastContainer({ toasts, onClose }: ToastContainerProps): JSX.Element | null {
    if (toasts.length === 0) {
        return null;
    }

    return (
        <div class="toast toast-top toast-end z-50 w-[calc(100vw-1rem)] max-w-sm sm:w-auto sm:max-w-none">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    variant={toast.variant}
                    message={toast.message}
                    icon={toast.icon}
                    onClose={() => onClose(toast.id)}
                />
            ))}
        </div>
    );
}

