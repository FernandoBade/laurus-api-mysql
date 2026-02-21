import type { JSX } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { IconName } from "@shared/enums/icon.enums";
import { ButtonSize, ButtonVariant, ModalPosition, ModalScrollMode, ModalSize } from "@shared/enums/ui.enums";
import { Button } from "@/components/button/button";
import type { ModalProps } from "@/components/modal/modal.types";
import { classNames } from "@/utils/classNames";
import { t } from "@/utils/i18n/translate";

const sizeMap: Record<ModalSize, string> = {
    [ModalSize.SM]: "max-w-md",
    [ModalSize.MD]: "max-w-2xl",
    [ModalSize.LG]: "max-w-4xl",
    [ModalSize.XL]: "max-w-6xl",
};

const positionMap: Record<ModalPosition, string> = {
    [ModalPosition.CENTER]: "modal-middle",
    [ModalPosition.TOP]: "modal-top",
    [ModalPosition.BOTTOM]: "modal-bottom",
};

const dialogScrollMap: Record<ModalScrollMode, string> = {
    [ModalScrollMode.INSIDE]: "overflow-hidden",
    [ModalScrollMode.BODY]: "overflow-y-auto",
};

const contentScrollMap: Record<ModalScrollMode, string> = {
    [ModalScrollMode.INSIDE]: "max-h-[calc(100vh-6rem)] overflow-y-auto",
    [ModalScrollMode.BODY]: "overflow-visible",
};

/**
 * @summary Renders an accessible modal dialog with typed size, position, and footer slots.
 * @param props Modal configuration.
 * @returns Modal dialog component.
 */

export function Modal({
    open,
    title,
    size = ModalSize.MD,
    position = ModalPosition.CENTER,
    scrollMode = ModalScrollMode.INSIDE,
    closeOnBackdrop = true,
    closeOnEsc = true,
    showCloseButton = true,
    onClose,
    children,
    footer,
}: ModalProps): JSX.Element {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) {
            return;
        }

        if (open && !dialog.open) {
            dialog.showModal();
        }

        if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) {
            return;
        }

        const handleCancel = (event: Event): void => {
            if (!closeOnEsc) {
                event.preventDefault();
            }
        };

        const handleClose = (): void => {
            onClose();
        };

        dialog.addEventListener("cancel", handleCancel);
        dialog.addEventListener("close", handleClose);
        return (): void => {
            dialog.removeEventListener("cancel", handleCancel);
            dialog.removeEventListener("close", handleClose);
        };
    }, [closeOnEsc, onClose]);

    useEffect(() => {
        if (typeof document === "undefined") {
            return;
        }

        const previousOverflow = document.body.style.overflow;

        if (open) {
            document.body.style.overflow = "hidden";
        }

        return (): void => {
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    const handleBackdropClick: JSX.MouseEventHandler<HTMLDialogElement> = (event): void => {
        if (!closeOnBackdrop) {
            return;
        }

        if (event.currentTarget === event.target) {
            event.currentTarget.close();
        }
    };

    const handleCloseClick = (): void => {
        const dialog = dialogRef.current;
        if (dialog?.open) {
            dialog.close();
        }
    };

    return (
        <dialog
            ref={dialogRef}
            class={classNames("modal", positionMap[position], dialogScrollMap[scrollMode])}
            onClick={handleBackdropClick}
        >
            <div class={classNames("modal-box", sizeMap[size], contentScrollMap[scrollMode])}>
                {showCloseButton ? (
                    <div class="absolute right-3 top-3">
                        <Button
                            variant={ButtonVariant.GHOST}
                            size={ButtonSize.SM}
                            iconLeft={IconName.CLOSE}
                            onClick={handleCloseClick}
                        />
                    </div>
                ) : null}

                {title ? <h3 class="text-section-title">{t(title)}</h3> : null}
                <div class={title ? "mt-4" : undefined}>{children}</div>
                {footer ? (
                    <div class="modal-action mt-6 flex-col-reverse items-stretch justify-start gap-2 sm:flex-row sm:items-center sm:justify-end [&>:not([hidden])~:not([hidden])]:ml-0 [&>*]:w-full sm:[&>*]:w-auto">
                        {footer}
                    </div>
                ) : null}
            </div>
        </dialog>
    );
}
