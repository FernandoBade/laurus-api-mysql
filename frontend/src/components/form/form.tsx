import type { JSX } from "preact";
import type { FormProps } from "@/components/form/form.types";

/**
 * @summary Wraps form submission and delegates submit handling without page reload.
 * @param props Form configuration.
 * @returns Form component.
 */

export function Form({
    children,
    onSubmit,
    preventDefault = true,
    disabled = false,
    noValidate = true,
}: FormProps): JSX.Element {
    const handleSubmit = async (event: JSX.TargetedEvent<HTMLFormElement, Event>): Promise<void> => {
        if (preventDefault) {
            event.preventDefault();
        }

        await onSubmit?.(event);
    };

    return (
        <form noValidate={noValidate} onSubmit={handleSubmit}>
            <fieldset disabled={disabled} class="space-y-4">
                {children}
            </fieldset>
        </form>
    );
}
