import type { ComponentChildren, JSX } from "preact";
import type { ResourceKey } from "@shared/i18n/resource.keys";
import { IconName } from "@shared/enums/icon.enums";
import { ButtonSize, ButtonVariant } from "@shared/enums/ui.enums";

/**
 * @summary Typed button props with internal Daisy variant mapping.
 */
export interface ButtonProps {
    readonly label?: ResourceKey;
    readonly children?: ComponentChildren;
    readonly ariaLabel?: ResourceKey;
    readonly variant?: ButtonVariant;
    readonly size?: ButtonSize;
    readonly disabled?: boolean;
    readonly loading?: boolean;
    readonly iconLeft?: IconName;
    readonly iconRight?: IconName;
    readonly type?: JSX.ButtonHTMLAttributes<HTMLButtonElement>["type"];
    readonly onClick?: JSX.MouseEventHandler<HTMLButtonElement>;
}
