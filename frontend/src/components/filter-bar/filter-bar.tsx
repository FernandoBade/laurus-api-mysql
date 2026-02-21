import type { JSX } from "preact";
import { FilterFieldType } from "@shared/enums/filter.enums";
import { IconName } from "@shared/enums/icon.enums";
import { InputType } from "@shared/enums/input.enums";
import { ButtonVariant } from "@shared/enums/ui.enums";
import { Button } from "@/components/button/button";
import { Form } from "@/components/form/form";
import { FormGrid } from "@/components/form-grid/form-grid";
import { Input } from "@/components/input/input";
import { Select } from "@/components/select/select";
import type { FilterBarProps, SelectFieldConfig, TextFieldConfig } from "@/components/filter-bar/filter-bar.types";

function withUpdatedField<TValues extends Record<string, unknown>, TKey extends keyof TValues>(
    values: Partial<TValues>,
    fieldName: TKey,
    nextValue: TValues[TKey]
): Partial<TValues> {
    return {
        ...values,
        [fieldName]: nextValue,
    };
}

/**
 * @summary Serialize fallback helper function.
 */
function serializeFallback(value: unknown): string {
    return typeof value === "string" ? value : "";
}

/**
 * @summary Renders a generic typed filter bar with auto-generated fields.
 * @param props Filter bar configuration.
 * @returns Filter bar component.
 */
export function FilterBar<TValues extends Record<string, unknown>>({
    fields,
    values,
    onChange,
    columns = 3,
    submitButtonLabel,
    clearButtonLabel,
    onSubmit,
    onClear,
}: FilterBarProps<TValues>): JSX.Element {
    const updateFieldValue = <TKey extends keyof TValues>(fieldName: TKey, nextValue: TValues[TKey]): void => {
        onChange(withUpdatedField(values, fieldName, nextValue));
    };

    const handleClear = (): void => {
        onChange({});
        onClear?.();
    };

    const renderSelectField = <TKey extends keyof TValues>(fieldId: string, field: SelectFieldConfig<TValues, TKey>): JSX.Element => {
        const rawValue = values[field.name];
        const resolvedValue = field.serialize ? field.serialize(rawValue) : serializeFallback(rawValue);

        return (
            <Select
                key={fieldId}
                label={field.label}
                placeholder={field.placeholder}
                options={field.options}
                value={resolvedValue}
                required={field.required}
                icon={field.icon}
                onChange={(nextValue) => updateFieldValue(field.name, field.parse(nextValue))}
            />
        );
    };

    const renderTextField = <TKey extends keyof TValues>(fieldId: string, field: TextFieldConfig<TValues, TKey>): JSX.Element => {
        const rawValue = values[field.name];
        const resolvedValue = field.serialize ? field.serialize(rawValue) : serializeFallback(rawValue);

        return (
            <Input
                key={fieldId}
                id={fieldId}
                label={field.label}
                placeholder={field.placeholder}
                type={field.inputType ?? InputType.TEXT}
                value={resolvedValue}
                required={field.required}
                icon={field.icon}
                onChange={(nextValue) => updateFieldValue(field.name, field.parse(nextValue))}
            />
        );
    };

    return (
        <Form onSubmit={() => onSubmit?.()}>
            <FormGrid columns={columns}>
                {fields.map((field) => {
                    const fieldId = String(field.name);

                    if (field.type === FilterFieldType.SELECT) {
                        return renderSelectField(fieldId, field);
                    }

                    return renderTextField(fieldId, field);
                })}
            </FormGrid>

            <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {submitButtonLabel || onSubmit ? (
                    <div class="w-full sm:w-auto [&>button]:w-full sm:[&>button]:w-auto">
                        <Button
                            type="submit"
                            variant={ButtonVariant.PRIMARY}
                            label={submitButtonLabel}
                            iconLeft={IconName.SEARCH}
                        />
                    </div>
                ) : null}

                {clearButtonLabel || onClear ? (
                    <div class="w-full sm:w-auto [&>button]:w-full sm:[&>button]:w-auto">
                        <Button
                            variant={ButtonVariant.OUTLINE}
                            label={clearButtonLabel}
                            iconLeft={IconName.CLOSE}
                            onClick={handleClear}
                        />
                    </div>
                ) : null}
            </div>
        </Form>
    );
}

