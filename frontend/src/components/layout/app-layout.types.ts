import type { ComponentChildren } from "preact";

/**
 * @summary Typed app layout props.
 */
export interface AppLayoutProps {
    readonly children: ComponentChildren;
    readonly header?: ComponentChildren;
    readonly footer?: ComponentChildren;
}
