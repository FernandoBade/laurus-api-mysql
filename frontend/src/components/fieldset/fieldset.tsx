import type { JSX } from "preact";
import type { FieldsetProps } from "@/components/fieldset/fieldset.types";
import { t } from "@/utils/i18n/translate";

/**
 * @summary Groups related form elements with optional legend and description.
 * @param props Fieldset configuration.
 * @returns Fieldset component.
 */
export function Fieldset({ legend, description, children }: FieldsetProps): JSX.Element {
    return (
        <fieldset class="rounded-box border border-base-300 p-4">
            {legend ? <legend class="px-1 text-sm font-semibold">{t(legend)}</legend> : null}
            {description ? <p class="mb-3 text-sm text-base-content/70">{t(description)}</p> : null}
            {children}
        </fieldset>
    );
}
