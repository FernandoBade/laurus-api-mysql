import type { ResourceKey } from "@shared/i18n/resource.keys";
import { IconName } from "@shared/enums/icon.enums";

/**
 * @summary Typed empty state props.
 */
export interface EmptyStateProps {
    readonly title: ResourceKey;
    readonly description?: ResourceKey;
    readonly icon?: IconName;
    readonly actionLabel?: ResourceKey;
    readonly onAction?: () => void;
}
