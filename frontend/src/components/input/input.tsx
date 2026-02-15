import type { JSX } from "preact";
import { IconPosition } from "@shared/enums/icon-position.enums";
import { InputType } from "@shared/enums/input.enums";
import { Icon } from "@/components/icon/icon";
import type { InputProps } from "@/components/input/input.types";
import { classNames } from "@/utils/classNames";
import { t, tOptional } from "@/utils/i18n/translate";

const inputTypeMap: Partial<Record<InputType, JSX.InputHTMLAttributes<HTMLInputElement>["type"]>> = {
    [InputType.TEXT]: InputType.TEXT,
    [InputType.EMAIL]: InputType.EMAIL,
    [InputType.PASSWORD]: InputType.PASSWORD,
    [InputType.SEARCH]: InputType.SEARCH,
    [InputType.NUMBER]: InputType.NUMBER,
    [InputType.TEL]: InputType.TEL,
    [InputType.URL]: InputType.URL,
};

/**
 * @summary Renders a typed input with semantic error/hint and icon slots.
 * @param props Input configuration.
 * @returns Input field component.
 */
export function Input({
    label,
    placeholder,
    hint,
    type = InputType.TEXT,
    value,
    required = false,
    disabled = false,
    readOnly = false,
    name,
    id,
    autoComplete,
    error,
    icon,
    iconPosition = IconPosition.LEFT,
    prefixText,
    suffixText,
    rightSlot,
    leftSlot,
    maxLength,
    minLength,
    inputMode,
    onChange,
    onBlur,
}: InputProps): JSX.Element {
    const handleInput: JSX.GenericEventHandler<HTMLInputElement> = (event): void => {
        onChange?.(event.currentTarget.value);
    };

    return (
        <div class="form-control w-full">
            {label ? (
                <label class="label" for={id}>
                    <span class="label-text">{t(label)}</span>
                </label>
            ) : null}

            <div class="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                {prefixText ? <span class="badge badge-neutral self-start sm:self-auto">{t(prefixText)}</span> : null}

                <label class={classNames("input input-bordered flex w-full min-w-0 items-center gap-2", error ? "input-error" : undefined)}>
                    {leftSlot}
                    {icon && iconPosition === IconPosition.LEFT ? <Icon name={icon} weight="fill" size={20} /> : null}
                    <input
                        id={id}
                        class="min-w-0 grow bg-transparent outline-none"
                        name={name}
                        type={inputTypeMap[type] ?? InputType.TEXT}
                        value={value}
                        required={required}
                        disabled={disabled}
                        readOnly={readOnly}
                        autoComplete={autoComplete}
                        placeholder={tOptional(placeholder)}
                        maxLength={maxLength}
                        minLength={minLength}
                        inputMode={inputMode}
                        onInput={handleInput}
                        onBlur={onBlur}
                    />
                    {icon && iconPosition === IconPosition.RIGHT ? <Icon name={icon} size={16} /> : null}
                    {rightSlot}
                </label>

                {suffixText ? <span class="badge badge-neutral self-start sm:self-auto">{t(suffixText)}</span> : null}
            </div>

            {error ? (
                <label class="label">
                    <span class="label-text-alt text-error">{t(error)}</span>
                </label>
            ) : hint ? (
                <label class="label">
                    <span class="label-text-alt">{t(hint)}</span>
                </label>
            ) : null}
        </div>
    );
}
