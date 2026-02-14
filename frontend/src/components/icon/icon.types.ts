import type { IconWeight } from "@phosphor-icons/react";
import { IconName } from "@shared/enums/icon.enums";

/**
 * @summary Typed icon props for semantic icon rendering.
 */
export interface IconProps {
    readonly name: IconName;
    readonly size?: number;
    readonly weight?: IconWeight;
    readonly mirrored?: boolean;
}
