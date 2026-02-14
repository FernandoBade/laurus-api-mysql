import type { ComponentChildren } from "preact";
import type { ResourceKey } from "@shared/i18n/resource.keys";
import { TooltipPosition } from "@shared/enums/ui.enums";

/**
 * @summary Typed tooltip props.
 */
export interface TooltipProps {
    readonly content: ResourceKey;
    readonly position?: TooltipPosition;
    readonly children: ComponentChildren;
}
