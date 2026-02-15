import type { JSX } from "preact";
import { useState } from "preact/hooks";
import type { AccordionItem, AccordionProps } from "@/components/accordion/accordion.types";
import { t } from "@/utils/i18n/translate";

function resolveDefaultOpenItem(items: readonly AccordionItem[]): string | null {
    const firstOpen = items.find((item) => item.openByDefault);
    return firstOpen ? firstOpen.id : null;
}

/**
 * @summary Renders a typed accordion with optional single-open behavior.
 * @param props Accordion configuration.
 * @returns Accordion component.
 */
export function Accordion({ items, allowMultiple = true }: AccordionProps): JSX.Element | null {
    const [openItemId, setOpenItemId] = useState<string | null>(resolveDefaultOpenItem(items));

    if (items.length === 0) {
        return null;
    }

    return (
        <div class="space-y-2">
            {items.map((item) => {
                const isOpen = allowMultiple ? item.openByDefault : openItemId === item.id;

                return (
                    <details
                        key={item.id}
                        class="collapse collapse-arrow border border-base-300 bg-base-100"
                        open={Boolean(isOpen)}
                        onToggle={(event) => {
                            if (allowMultiple) {
                                return;
                            }

                            const details = event.currentTarget;
                            setOpenItemId(details.open ? item.id : null);
                        }}
                    >
                        <summary class="collapse-title text-label font-semibold">{t(item.title)}</summary>
                        <div class="collapse-content text-body">{item.content}</div>
                    </details>
                );
            })}
        </div>
    );
}
