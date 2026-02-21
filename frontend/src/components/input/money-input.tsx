import type { JSX } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { NumericInputValidationError } from "@shared/enums/input-validation.enums";
import { InputType } from "@shared/enums/input.enums";
import { ResourceKey } from "@shared/i18n/resource.keys";
import { Input } from "@/components/input/input";
import type { CanonicalInputValueChange } from "@/components/input/canonical-input.types";
import type { MoneyInputProps } from "@/components/input/money-input.types";
import {
    toCanonicalWithFixedFraction,
    validateCanonicalDecimal,
} from "@/utils/intl/decimalInput";
import {
    canonicalToMaskedValue,
    createNumericMask,
    maskedValueToCanonical,
    type NumericMaskInstance,
} from "@/utils/intl/numericMask";

const MONEY_FRACTION_DIGITS = 2;

const DEFAULT_ERROR_BY_VALIDATION: Readonly<Record<NumericInputValidationError, ResourceKey>> = {
    [NumericInputValidationError.REQUIRED]: ResourceKey.FIELD_REQUIRED_GENERIC,
    [NumericInputValidationError.INVALID]: ResourceKey.INVALID_NUMBER_VALUE,
    [NumericInputValidationError.MIN]: ResourceKey.VALUE_BELOW_MINIMUM,
    [NumericInputValidationError.MAX]: ResourceKey.VALUE_ABOVE_MAXIMUM,
    [NumericInputValidationError.GREATER_THAN_ZERO]: ResourceKey.VALUE_MUST_BE_GREATER_THAN_ZERO,
};


function formatMoneyDisplay(
    canonicalValue: string,
    language: MoneyInputProps["language"]
): string {
    if (canonicalValue.trim().length === 0) {
        return "";
    }

    return canonicalToMaskedValue(canonicalValue, language, {
        minimumFractionDigits: MONEY_FRACTION_DIGITS,
        maximumFractionDigits: MONEY_FRACTION_DIGITS,
    });
}


function resolveValidationErrorKey(
    canonicalValue: string,
    props: Pick<
        MoneyInputProps,
        "required" | "min" | "max" | "greaterThanZero" | "validationResourceKeys"
    >
): ResourceKey | undefined {
    const validationError = validateCanonicalDecimal(canonicalValue, {
        required: props.required,
        min: props.min,
        max: props.max,
        greaterThanZero: props.greaterThanZero,
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
 * @summary Renders a locale-aware currency input that emits canonical decimal values.
 * @param props Money input configuration.
 * @returns Money input component.
 */

export function MoneyInput({
    canonicalValue,
    language,
    currency,
    min,
    max,
    greaterThanZero = false,
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
}: MoneyInputProps): JSX.Element {
    const [displayValue, setDisplayValue] = useState<string>(() =>
        formatMoneyDisplay(canonicalValue, language)
    );
    const [isTouched, setIsTouched] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const maskRef = useRef<NumericMaskInstance | null>(null);
    const syncingMaskRef = useRef<boolean>(false);
    const lastEmittedCanonicalRef = useRef<string>(canonicalValue);
    const lastLocaleKeyRef = useRef<string>(`${language}::${currency}`);
    const onValueChangeRef = useRef<MoneyInputProps["onValueChange"]>(onValueChange);
    const validationPropsRef = useRef<
        Pick<MoneyInputProps, "required" | "min" | "max" | "greaterThanZero" | "validationResourceKeys">
    >({
        required,
        min,
        max,
        greaterThanZero,
        validationResourceKeys,
    });
    const isTouchedRef = useRef<boolean>(isTouched);

    onValueChangeRef.current = onValueChange;
    validationPropsRef.current = {
        required,
        min,
        max,
        greaterThanZero,
        validationResourceKeys,
    };
    isTouchedRef.current = isTouched;

    const draftCanonicalValue = useMemo(
        () => maskedValueToCanonical(displayValue, language, MONEY_FRACTION_DIGITS),
        [displayValue, language]
    );
    useEffect(() => {
        const localeKey = `${language}::${currency}`;
        const localeChanged = localeKey !== lastLocaleKeyRef.current;
        const canonicalChangedExternally = canonicalValue !== lastEmittedCanonicalRef.current;

        if (localeChanged || canonicalChangedExternally) {
            const nextDisplayValue = formatMoneyDisplay(canonicalValue, language);
            setDisplayValue(nextDisplayValue);

            if (maskRef.current) {
                syncingMaskRef.current = true;
                maskRef.current.value = nextDisplayValue;
                syncingMaskRef.current = false;
            }
        }

        lastLocaleKeyRef.current = localeKey;
        if (canonicalChangedExternally) {
            lastEmittedCanonicalRef.current = canonicalValue;
        }
    }, [canonicalValue, currency, language]);

    const computedValidationError = useMemo(
        () =>
            resolveValidationErrorKey(draftCanonicalValue, {
                required,
                min,
                max,
                greaterThanZero,
                validationResourceKeys,
            }),
        [
            draftCanonicalValue,
            greaterThanZero,
            max,
            min,
            required,
            validationResourceKeys,
        ]
    );
    const resolvedError = error ?? (isTouched ? computedValidationError : undefined);

    useEffect(() => {
        const inputElement = inputRef.current;
        if (!inputElement) {
            return;
        }

        const mask = createNumericMask(inputElement, {
            language,
            scale: MONEY_FRACTION_DIGITS,
            padFractionalZeros: true,
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
                MONEY_FRACTION_DIGITS
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
    }, [language]);

    const handleBlur = (): void => {
        setIsTouched(true);
        isTouchedRef.current = true;
        const maskDisplayValue = maskRef.current?.value ?? displayValue;
        const parsedCanonicalValue = maskedValueToCanonical(
            maskDisplayValue,
            language,
            MONEY_FRACTION_DIGITS
        );
        const normalizedCanonicalValue = parsedCanonicalValue.length === 0
            ? ""
            : (toCanonicalWithFixedFraction(parsedCanonicalValue, MONEY_FRACTION_DIGITS)
                ?? "");
        const normalizedDisplay = formatMoneyDisplay(normalizedCanonicalValue, language);
        const nextError = resolveValidationErrorKey(normalizedCanonicalValue, {
            required,
            min,
            max,
            greaterThanZero,
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

    const combinedRightSlot = (
        <>
            {rightSlot}
            <span class="pointer-events-none whitespace-nowrap text-caption font-data text-base-content/70">
                {currency}
            </span>
        </>
    );

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
            rightSlot={combinedRightSlot}
            leftSlot={leftSlot}
            maxLength={maxLength}
            minLength={minLength}
            inputMode="decimal"
            inputRef={inputRef}
            onBlur={handleBlur}
        />
    );
}
