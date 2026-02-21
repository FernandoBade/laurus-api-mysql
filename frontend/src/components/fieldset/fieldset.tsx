import type { JSX } from "preact";
import type { FieldsetProps } from "@/components/fieldset/fieldset.types";
import { t } from "@/utils/i18n/translate";

/**
 * @summary Renders grouped form fields with legend and optional description.
 * @param props Fieldset configuration.
 * @returns Fieldset component.
 */

export function Fieldset({ legend, description, children }: FieldsetProps): JSX.Element {
    return (
        <fieldset class="rounded-box border border-base-300 p-4">
            {legend ? <legend class="px-1 text-label font-semibold">{t(legend)}</legend> : null}
            {description ? <p class="mb-3 text-body text-base-content/70">{t(description)}</p> : null}
            {children}
        </fieldset>
    );
}
