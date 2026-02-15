import type { ComponentChildren } from "preact";

/**
 * @summary Typed props for the reusable collapse container.
 */
export interface CollapseProps {
    readonly id: string;
    readonly title: ComponentChildren;
    readonly description?: ComponentChildren;
    readonly open: boolean;
    readonly onToggle: (open: boolean) => void;
    readonly children: ComponentChildren;
    readonly className?: string;
    readonly headerClassName?: string;
    readonly titleClassName?: string;
    readonly descriptionClassName?: string;
    readonly iconClassName?: string;
    readonly contentClassName?: string;
}
