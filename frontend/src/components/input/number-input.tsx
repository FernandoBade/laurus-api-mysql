import type { JSX } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { NumericInputValidationError } from "@shared/enums/input-validation.enums";
import { InputType } from "@shared/enums/input.enums";
import { ResourceKey } from "@shared/i18n/resource.keys";
import { Input } from "@/components/input/input";
import type { CanonicalInputValueChange } from "@/components/input/canonical-input.types";
import type { NumberInputProps } from "@/components/input/number-input.types";
import {
    validateCanonicalDecimal,
} from "@/utils/intl/decimalInput";
import {
    canonicalToMaskedValue,
    createNumericMask,
    maskedValueToCanonical,
    type NumericMaskInstance,
} from "@/utils/intl/numericMask";

const DEFAULT_NUMBER_FRACTION_DIGITS = 4;

const DEFAULT_ERROR_BY_VALIDATION: Readonly<Record<NumericInputValidationError, ResourceKey>> = {
    [NumericInputValidationError.REQUIRED]: ResourceKey.FIELD_REQUIRED_GENERIC,
    [NumericInputValidationError.INVALID]: ResourceKey.INVALID_NUMBER_VALUE,
    [NumericInputValidationError.MIN]: ResourceKey.VALUE_BELOW_MINIMUM,
    [NumericInputValidationError.MAX]: ResourceKey.VALUE_ABOVE_MAXIMUM,
    [NumericInputValidationError.GREATER_THAN_ZERO]: ResourceKey.VALUE_MUST_BE_GREATER_THAN_ZERO,
};


function formatNumberDisplay(canonicalValue: string, language: NumberInputProps["language"]): string {
    if (canonicalValue.trim().length === 0) {
        return "";
    }

    return canonicalToMaskedValue(canonicalValue, language);
}


function resolveValidationErrorKey(
    canonicalValue: string,
    props: Pick<NumberInputProps, "required" | "min" | "max" | "validationResourceKeys">
): ResourceKey | undefined {
    const validationError = validateCanonicalDecimal(canonicalValue, {
        required: props.required,
        min: props.min,
        max: props.max,
    });

    if (validationError === null) {
        return undefined;
    }

    return props.validationResourceKeys?.[validationError] ?? DEFAULT_ERROR_BY_VALIDATION[validationError];
}


function createValueChange(
    canonicalValue: string,
    displayValue: string,
    error: ResourceKey | undefined
): CanonicalInputValueChange {
    return {
        canonicalValue,
        displayValue,
        error,
    };
}

/**
 * @summary Renders a locale-aware decimal input that emits canonical numeric values.
 * @param props Number input configuration.
 * @returns Number input component.
 */

export function NumberInput({
    canonicalValue,
    language,
    min,
    max,
    maxFractionDigits = DEFAULT_NUMBER_FRACTION_DIGITS,
    validationResourceKeys,
    label,
    placeholder,
    hint,
    required = false,
    disabled = false,
    readOnly = false,
    name,
    id,
    autoComplete,
    error,
    icon,
    iconPosition,
    prefixText,
    suffixText,
    rightSlot,
    leftSlot,
    maxLength,
    minLength,
    onValueChange,
    onValueBlur,
}: NumberInputProps): JSX.Element {
    const [displayValue, setDisplayValue] = useState<string>(() =>
        formatNumberDisplay(canonicalValue, language)
    );
    const [isTouched, setIsTouched] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const maskRef = useRef<NumericMaskInstance | null>(null);
    const syncingMaskRef = useRef<boolean>(false);
    const lastEmittedCanonicalRef = useRef<string>(canonicalValue);
    const lastLanguageRef = useRef<NumberInputProps["language"]>(language);
    const onValueChangeRef = useRef<NumberInputProps["onValueChange"]>(onValueChange);
    const validationPropsRef = useRef<
        Pick<NumberInputProps, "required" | "min" | "max" | "validationResourceKeys">
    >({
        required,
        min,
        max,
        validationResourceKeys,
    });
    const isTouchedRef = useRef<boolean>(isTouched);

    onValueChangeRef.current = onValueChange;
    validationPropsRef.current = {
        required,
        min,
        max,
        validationResourceKeys,
    };
    isTouchedRef.current = isTouched;

    useEffect(() => {
        const localeChanged = language !== lastLanguageRef.current;
        const canonicalChangedExternally = canonicalValue !== lastEmittedCanonicalRef.current;

        if (localeChanged || canonicalChangedExternally) {
            const nextDisplayValue = formatNumberDisplay(canonicalValue, language);
            setDisplayValue(nextDisplayValue);

            if (maskRef.current) {
                syncingMaskRef.current = true;
                maskRef.current.value = nextDisplayValue;
                syncingMaskRef.current = false;
            }
        }

        lastLanguageRef.current = language;
        if (canonicalChangedExternally) {
            lastEmittedCanonicalRef.current = canonicalValue;
        }
    }, [canonicalValue, language]);

    const draftCanonicalValue = useMemo(
        () => maskedValueToCanonical(displayValue, language, maxFractionDigits),
        [displayValue, language, maxFractionDigits]
    );
    const computedValidationError = useMemo(
        () =>
            resolveValidationErrorKey(draftCanonicalValue, {
                required,
                min,
                max,
                validationResourceKeys,
            }),
        [draftCanonicalValue, max, min, required, validationResourceKeys]
    );
    const resolvedError = error ?? (isTouched ? computedValidationError : undefined);

    useEffect(() => {
        const inputElement = inputRef.current;
        if (!inputElement) {
            return;
        }

        const mask = createNumericMask(inputElement, {
            language,
            scale: maxFractionDigits,
            padFractionalZeros: false,
            normalizeZeros: true,
            useThousandsSeparator: true,
        });
        maskRef.current = mask;
        syncingMaskRef.current = true;
        mask.value = inputElement.value;
        syncingMaskRef.current = false;

        const handleAccept = (): void => {
            if (syncingMaskRef.current) {
                return;
            }

            const nextDisplayValue = mask.value;
            const nextCanonicalValue = maskedValueToCanonical(
                nextDisplayValue,
                language,
                maxFractionDigits
            );
            const nextError = resolveValidationErrorKey(nextCanonicalValue, validationPropsRef.current);

            setDisplayValue(nextDisplayValue);
            lastEmittedCanonicalRef.current = nextCanonicalValue;
            onValueChangeRef.current?.(
                createValueChange(
                    nextCanonicalValue,
                    nextDisplayValue,
                    isTouchedRef.current ? nextError : undefined
                )
            );
        };

        mask.on("accept", handleAccept);

        return () => {
            mask.off("accept", handleAccept);
            mask.destroy();
            if (maskRef.current === mask) {
                maskRef.current = null;
            }
        };
    }, [language, maxFractionDigits]);

    const handleBlur = (): void => {
        setIsTouched(true);
        isTouchedRef.current = true;
        const normalizedCanonicalValue = maskedValueToCanonical(
            maskRef.current?.value ?? displayValue,
            language,
            maxFractionDigits
        );
        const normalizedDisplay = formatNumberDisplay(normalizedCanonicalValue, language);
        const nextError = resolveValidationErrorKey(normalizedCanonicalValue, {
            required,
            min,
            max,
            validationResourceKeys,
        });
        const nextValue = createValueChange(
            normalizedCanonicalValue,
            normalizedDisplay,
            nextError
        );

        if (maskRef.current) {
            syncingMaskRef.current = true;
            maskRef.current.value = normalizedDisplay;
            syncingMaskRef.current = false;
        }
        setDisplayValue(normalizedDisplay);
        lastEmittedCanonicalRef.current = normalizedCanonicalValue;

        if (
            normalizedCanonicalValue !== canonicalValue
            || normalizedDisplay !== displayValue
        ) {
            onValueChangeRef.current?.(nextValue);
        }

        onValueBlur?.(nextValue);
    };

    return (
        <Input
            label={label}
            placeholder={placeholder}
            hint={hint}
            type={InputType.TEXT}
            value={displayValue}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            name={name}
            id={id}
            autoComplete={autoComplete}
            error={resolvedError}
            icon={icon}
            iconPosition={iconPosition}
            prefixText={prefixText}
            suffixText={suffixText}
            rightSlot={rightSlot}
            leftSlot={leftSlot}
            maxLength={maxLength}
            minLength={minLength}
            inputMode="decimal"
            inputRef={inputRef}
            onBlur={handleBlur}
        />
    );
}
