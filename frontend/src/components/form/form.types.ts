import type { ComponentChildren, JSX } from "preact";

/**
 * @summary Typed form wrapper props.
 */
export interface FormProps {
    readonly children: ComponentChildren;
    readonly onSubmit?: (event: JSX.TargetedEvent<HTMLFormElement, Event>) => void | Promise<void>;
    readonly preventDefault?: boolean;
    readonly disabled?: boolean;
    readonly noValidate?: boolean;
}
