import type { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import type { AccordionItem, AccordionProps } from "@/components/accordion/accordion.types";
import { Collapse } from "@/components/collapse/collapse";
import { t } from "@/utils/i18n/translate";

/**
 * @summary Resolves default open item.
 */
function resolveDefaultOpenItem(items: readonly AccordionItem[]): string | null {
    const firstOpen = items.find((item) => item.openByDefault);
    return firstOpen ? firstOpen.id : null;
}

/**
 * @summary Resolves default open items.
 */
function resolveDefaultOpenItems(items: readonly AccordionItem[]): readonly string[] {
    return items.filter((item) => item.openByDefault).map((item) => item.id);
}

/**
 * @summary Renders a typed accordion with optional single-open behavior.
 * @param props Accordion configuration.
 * @returns Accordion component.
 */
export function Accordion({ items, allowMultiple = true }: AccordionProps): JSX.Element | null {
    const [openItemId, setOpenItemId] = useState<string | null>(resolveDefaultOpenItem(items));
    const [openItemIds, setOpenItemIds] = useState<readonly string[]>(resolveDefaultOpenItems(items));

    useEffect(() => {
        setOpenItemId(resolveDefaultOpenItem(items));
        setOpenItemIds(resolveDefaultOpenItems(items));
    }, [items, allowMultiple]);

    if (items.length === 0) {
        return null;
    }

    const toggleItem = (itemId: string): void => {
        if (allowMultiple) {
            setOpenItemIds((current) => {
                if (current.includes(itemId)) {
                    return current.filter((id) => id !== itemId);
                }

                return [...current, itemId];
            });
            return;
        }

        setOpenItemId((current) => (current === itemId ? null : itemId));
    };

    return (
        <div class="space-y-2">
            {items.map((item) => {
                const isOpen = allowMultiple
                    ? openItemIds.includes(item.id)
                    : openItemId === item.id;

                return (
                    <Collapse
                        key={item.id}
                        id={`accordion-${item.id}`}
                        open={isOpen}
                        onToggle={() => toggleItem(item.id)}
                        title={t(item.title)}
                        titleClassName="text-label font-semibold"
                        contentClassName="px-4 pb-4 text-body"
                    >
                        {item.content}
                    </Collapse>
                );
            })}
        </div>
    );
}
