import type { ComponentChildren } from "preact";
import type { ResourceKey } from "@shared/i18n/resource.keys";
import { IconName } from "@shared/enums/icon.enums";
import { AlertDirection, AlertStyle, AlertVariant } from "@shared/enums/ui.enums";

/**
 * @summary Typed alert props supporting DaisyUI alert variants, styles and layouts.
 */
export interface AlertProps {
    readonly variant?: AlertVariant;
    readonly style?: AlertStyle;
    readonly direction?: AlertDirection;
    readonly message?: ResourceKey;
    readonly title?: ResourceKey;
    readonly description?: ResourceKey;
    readonly icon?: IconName;
    readonly hideIcon?: boolean;
    readonly actions?: ComponentChildren;
    readonly children?: ComponentChildren;
    readonly compact?: boolean;
}
