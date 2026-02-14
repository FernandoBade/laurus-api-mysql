import type { ResourceKey } from "@shared/i18n/resource.keys";
import { FilterFieldType } from "@shared/enums/filter.enums";
import { IconName } from "@shared/enums/icon.enums";
import { InputType } from "@shared/enums/input.enums";

export interface FilterOption {
    readonly label: ResourceKey;
    readonly value: string;
}

interface BaseFieldConfig<TValues extends Record<string, unknown>, TKey extends keyof TValues> {
    readonly name: TKey;
    readonly label: ResourceKey;
    readonly placeholder?: ResourceKey;
    readonly icon?: IconName;
    readonly required?: boolean;
    readonly parse: (rawValue: string) => TValues[TKey];
    readonly serialize?: (value: TValues[TKey] | undefined) => string;
}

export interface TextFieldConfig<TValues extends Record<string, unknown>, TKey extends keyof TValues>
    extends BaseFieldConfig<TValues, TKey> {
    readonly type: FilterFieldType.TEXT;
    readonly inputType?: InputType;
    readonly options?: never;
}

export interface SelectFieldConfig<TValues extends Record<string, unknown>, TKey extends keyof TValues>
    extends BaseFieldConfig<TValues, TKey> {
    readonly type: FilterFieldType.SELECT;
    readonly options: readonly FilterOption[];
    readonly inputType?: never;
}

/**
 * @summary Field definition used by generic filter-bar rendering.
 */
export type FieldConfig<TValues extends Record<string, unknown>> = {
    [TKey in keyof TValues]: TextFieldConfig<TValues, TKey> | SelectFieldConfig<TValues, TKey>;
}[keyof TValues];

/**
 * @summary Typed filter bar props.
 */
export interface FilterBarProps<TValues extends Record<string, unknown>> {
    readonly fields: readonly FieldConfig<TValues>[];
    readonly values: Partial<TValues>;
    readonly onChange: (values: Partial<TValues>) => void;
    readonly columns?: 1 | 2 | 3;
    readonly submitButtonLabel?: ResourceKey;
    readonly clearButtonLabel?: ResourceKey;
    readonly onSubmit?: () => void;
    readonly onClear?: () => void;
}
