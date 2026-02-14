import type { ComponentChildren } from "preact";
import type { ResourceKey } from "@shared/i18n/resource.keys";

export interface AccordionItem {
    readonly id: string;
    readonly title: ResourceKey;
    readonly content: ComponentChildren;
    readonly openByDefault?: boolean;
}

/**
 * @summary Typed accordion props.
 */
export interface AccordionProps {
    readonly items: readonly AccordionItem[];
    readonly allowMultiple?: boolean;
}
