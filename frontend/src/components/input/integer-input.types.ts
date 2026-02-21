import { NumericInputValidationError } from "@shared/enums/input-validation.enums";
import { Language } from "@shared/enums/user.enums";
import type { ResourceKey } from "@shared/i18n/resource.keys";
import type { CanonicalInputBaseProps } from "@/components/input/canonical-input.types";

/**
 * @summary Typed props for locale-aware integer input with canonical digit output.
 */
export interface IntegerInputProps extends CanonicalInputBaseProps {
    readonly language: Language;
    readonly min?: string;
    readonly max?: string;
    readonly useThousandsSeparator?: boolean;
    readonly validationResourceKeys?: Partial<Record<NumericInputValidationError, ResourceKey>>;
}
