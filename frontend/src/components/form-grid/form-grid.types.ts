import type { ComponentChildren } from "preact";

export type FormGridColumns = 1 | 2 | 3;

/**
 * @summary Typed responsive form grid props.
 */
export interface FormGridProps {
    readonly columns?: FormGridColumns;
    readonly children: ComponentChildren;
}
