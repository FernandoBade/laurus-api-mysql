import type { JSX } from "preact";
import { ButtonSize, ButtonVariant } from "@shared/enums/ui.enums";
import { Icon } from "@/components/icon/icon";
import type { ButtonProps } from "@/components/button/button.types";
import { classNames } from "@/utils/classNames";
import { t, tOptional } from "@/utils/i18n/translate";

const variantMap: Record<ButtonVariant, string> = {
    [ButtonVariant.PRIMARY]: "btn-primary",
    [ButtonVariant.SECONDARY]: "btn-secondary",
    [ButtonVariant.ACCENT]: "btn-accent",
    [ButtonVariant.OUTLINE]: "btn-outline",
    [ButtonVariant.GHOST]: "btn-ghost",
    [ButtonVariant.LINK]: "btn-link",
};

const sizeMap: Record<ButtonSize, string> = {
    [ButtonSize.SM]: "btn-sm",
    [ButtonSize.MD]: "",
    [ButtonSize.LG]: "btn-lg",
};

/**
 * @summary Renders a typed button with internal DaisyUI class mapping.
 * @param props Button configuration.
 * @returns Button component.
 */
export function Button({
    label,
    children,
    ariaLabel,
    variant = ButtonVariant.PRIMARY,
    size = ButtonSize.MD,
    disabled = false,
    loading = false,
    iconLeft,
    iconRight,
    type = "button",
    onClick,
}: ButtonProps): JSX.Element {
    const hasCustomContent = children !== undefined && children !== null;

    return (
        <button
            type={type}
            class={classNames("btn", variantMap[variant], sizeMap[size])}
            disabled={disabled || loading}
            aria-busy={loading}
            aria-label={tOptional(ariaLabel)}
            onClick={onClick}
        >
            {loading ? <span class="loading loading-spinner loading-xs" aria-hidden="true" /> : null}
            {!loading && iconLeft ? <Icon name={iconLeft} size={20} /> : null}
            {label ? <span>{t(label)}</span> : null}
            {!label && hasCustomContent ? <span>{children}</span> : null}
            {!loading && iconRight ? <Icon name={iconRight} size={20} /> : null}
        </button>
    );
}

