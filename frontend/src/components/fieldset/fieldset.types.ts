import type { ComponentChildren } from "preact";
import type { ResourceKey } from "@shared/i18n/resource.keys";

/**
 * @summary Typed fieldset props for grouped form controls.
 */
export interface FieldsetProps {
    readonly legend?: ResourceKey;
    readonly description?: ResourceKey;
    readonly children: ComponentChildren;
}
