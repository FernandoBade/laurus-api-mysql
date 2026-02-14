import type { ResourceKey } from "@shared/i18n/resource.keys";
import { IconPosition } from "@shared/enums/icon-position.enums";
import { IconName } from "@shared/enums/icon.enums";

export interface SelectOption {
    readonly label: ResourceKey;
    readonly value: string;
}

/**
 * @summary Typed select props for reusable option lists.
 */
export interface SelectProps {
    readonly label?: ResourceKey;
    readonly placeholder?: ResourceKey;
    readonly hint?: ResourceKey;
    readonly error?: ResourceKey;
    readonly options: readonly SelectOption[];
    readonly value?: string;
    readonly required?: boolean;
    readonly disabled?: boolean;
    readonly icon?: IconName;
    readonly iconPosition?: IconPosition;
    readonly onChange?: (value: string) => void;
}
