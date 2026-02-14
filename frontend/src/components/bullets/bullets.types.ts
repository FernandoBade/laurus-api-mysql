import type { ResourceKey } from "@shared/i18n/resource.keys";

/**
 * @summary Typed bullets props.
 */
export interface BulletsProps {
    readonly items: readonly ResourceKey[];
    readonly ordered?: boolean;
}
