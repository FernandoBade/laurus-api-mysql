import type { ResourceKey } from "@shared/i18n/resource.keys";
import type { InputProps } from "@/components/input/input.types";

/**
 * @summary Payload emitted by canonical inputs with display/canonical values and optional error key.
 */
export interface CanonicalInputValueChange {
    readonly canonicalValue: string;
    readonly displayValue: string;
    readonly error?: ResourceKey;
}

/**
 * @summary Base props shared by canonical inputs that emit backend-safe canonical values.
 */
export interface CanonicalInputBaseProps
    extends Omit<InputProps, "type" | "value" | "error" | "inputMode" | "onChange" | "onBlur"> {
    readonly canonicalValue: string;
    readonly error?: ResourceKey;
    readonly onValueChange?: (value: CanonicalInputValueChange) => void;
    readonly onValueBlur?: (value: CanonicalInputValueChange) => void;
}
