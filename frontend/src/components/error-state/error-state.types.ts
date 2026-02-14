import type { ResourceKey } from "@shared/i18n/resource.keys";
import { IconName } from "@shared/enums/icon.enums";

/**
 * @summary Typed error-state props.
 */
export interface ErrorStateProps {
    readonly title: ResourceKey;
    readonly description?: ResourceKey;
    readonly icon?: IconName;
    readonly actionLabel?: ResourceKey;
    readonly onAction?: () => void;
}
