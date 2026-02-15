import type { JSX } from "preact";
import { IconName } from "@shared/enums/icon.enums";
import { Icon } from "@/components/icon/icon";
import type { CollapseProps } from "@/components/collapse/collapse.types";
import { classNames } from "@/utils/classNames";

/**
 * @summary Renders a reusable animated collapse with controlled open state.
 * @param props Collapse configuration.
 * @returns Collapse component.
 */
export function Collapse({
    id,
    title,
    description,
    open,
    onToggle,
    children,
    className,
    headerClassName,
    titleClassName,
    descriptionClassName,
    iconClassName,
    contentClassName,
}: CollapseProps): JSX.Element {
    const headerId = `${id}-header`;
    const panelId = `${id}-panel`;

    return (
        <section class={classNames("overflow-hidden rounded-xl border border-base-300 bg-base-100", className)}>
            <button
                id={headerId}
                type="button"
                class={classNames(
                    "flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-base-200/30",
                    headerClassName
                )}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => onToggle(!open)}
            >
                <div class="space-y-1">
                    <div class={classNames("text-label font-semibold", titleClassName)}>{title}</div>
                    {description ? (
                        <div class={classNames("text-caption text-base-content/70", descriptionClassName)}>
                            {description}
                        </div>
                    ) : null}
                </div>
                <span
                    class={classNames(
                        "shrink-0 transition-transform duration-300 ease-out",
                        open ? "rotate-180" : undefined,
                        iconClassName
                    )}
                >
                    <Icon name={IconName.CHEVRON_DOWN} />
                </span>
            </button>

            <div
                id={panelId}
                role="region"
                aria-labelledby={headerId}
                class={classNames(
                    "grid border-t border-base-300 transition-[grid-template-rows] duration-300 ease-out",
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
            >
                <div class="overflow-hidden">
                    <div
                        class={classNames(
                            "px-4 pb-4 pt-3 transition-opacity duration-200",
                            open ? "opacity-100" : "opacity-0",
                            contentClassName
                        )}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </section>
    );
}
