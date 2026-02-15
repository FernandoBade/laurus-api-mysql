import type { JSX } from "preact";
import { TooltipPosition } from "@shared/enums/ui.enums";
import type { TooltipProps } from "@/components/tooltip/tooltip.types";
import { classNames } from "@/utils/classNames";
import { t } from "@/utils/i18n/translate";

const positionMap: Record<TooltipPosition, string> = {
    [TooltipPosition.TOP]: "tooltip-top",
    [TooltipPosition.RIGHT]: "tooltip-right",
    [TooltipPosition.BOTTOM]: "tooltip-bottom",
    [TooltipPosition.LEFT]: "tooltip-left",
};

/**
 * @summary Wraps content with a typed DaisyUI tooltip.
 * @param props Tooltip configuration.
 * @returns Tooltip wrapper.
 */
export function Tooltip({ content, position = TooltipPosition.TOP, children }: TooltipProps): JSX.Element {
    return (
        <div class={classNames("tooltip font-ui text-tooltip", positionMap[position])} data-tip={t(content)}>
            {children}
        </div>
    );
}

