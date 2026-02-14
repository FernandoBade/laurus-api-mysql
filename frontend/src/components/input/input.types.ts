import type { ComponentChildren, JSX } from "preact";
import type { ResourceKey } from "@shared/i18n/resource.keys";
import { IconPosition } from "@shared/enums/icon-position.enums";
import { IconName } from "@shared/enums/icon.enums";
import { InputType } from "@shared/enums/input.enums";

/**
 * @summary Typed input props for reusable form controls.
 */
export interface InputProps {
    readonly label?: ResourceKey;
    readonly placeholder?: ResourceKey;
    readonly hint?: ResourceKey;
    readonly type?: InputType;
    readonly value?: string;
    readonly required?: boolean;
    readonly disabled?: boolean;
    readonly readOnly?: boolean;
    readonly name?: string;
    readonly id?: string;
    readonly autoComplete?: string;
    readonly error?: ResourceKey;
    readonly icon?: IconName;
    readonly iconPosition?: IconPosition;
    readonly prefixText?: ResourceKey;
    readonly suffixText?: ResourceKey;
    readonly rightSlot?: ComponentChildren;
    readonly leftSlot?: ComponentChildren;
    readonly maxLength?: number;
    readonly minLength?: number;
    readonly inputMode?: JSX.InputHTMLAttributes<HTMLInputElement>["inputMode"];
    readonly onChange?: (value: string) => void;
    readonly onBlur?: () => void;
}
