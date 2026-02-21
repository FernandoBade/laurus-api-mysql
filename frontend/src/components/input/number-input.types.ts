import { NumericInputValidationError } from "@shared/enums/input-validation.enums";
import { Language } from "@shared/enums/user.enums";
import type { ResourceKey } from "@shared/i18n/resource.keys";
import type { CanonicalInputBaseProps } from "@/components/input/canonical-input.types";

/**
 * @summary Typed props for locale-aware decimal input with canonical output.
 */
export interface NumberInputProps extends CanonicalInputBaseProps {
    readonly language: Language;
    readonly min?: string;
    readonly max?: string;
    readonly maxFractionDigits?: number;
    readonly validationResourceKeys?: Partial<Record<NumericInputValidationError, ResourceKey>>;
}
