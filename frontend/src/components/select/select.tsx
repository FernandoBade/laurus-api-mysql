import type { JSX } from "preact";
import { IconPosition } from "@shared/enums/icon-position.enums";
import { Icon } from "@/components/icon/icon";
import type { SelectProps } from "@/components/select/select.types";
import { classNames } from "@/utils/classNames";
import { t, tOptional } from "@/utils/i18n/translate";

const iconPaddingMap: Record<IconPosition, string> = {
    [IconPosition.LEFT]: "pl-9",
    [IconPosition.RIGHT]: "pr-9",
};

const iconPlacementMap: Record<IconPosition, string> = {
    [IconPosition.LEFT]: "left-3",
    [IconPosition.RIGHT]: "right-3",
};

/**
 * @summary Renders a typed select input with translated labels/options.
 * @param props Select configuration.
 * @returns Select field component.
 */
export function Select({
    label,
    placeholder,
    hint,
    error,
    options,
    value,
    required = false,
    disabled = false,
    icon,
    iconPosition = IconPosition.LEFT,
    onChange,
}: SelectProps): JSX.Element {
    const handleChange: JSX.GenericEventHandler<HTMLSelectElement> = (event): void => {
        onChange?.(event.currentTarget.value);
    };

    return (
        <div class="form-control w-full">
            {label ? (
                <label class="label">
                    <span class="label-text">{t(label)}</span>
                </label>
            ) : null}

            <div class="relative w-full">
                {icon ? (
                    <span class={classNames("pointer-events-none absolute inset-y-0 z-10 flex items-center", iconPlacementMap[iconPosition])}>
                        <Icon name={icon} size={16} />
                    </span>
                ) : null}

                <select
                    class={classNames(
                        "select select-bordered w-full",
                        icon ? iconPaddingMap[iconPosition] : undefined,
                        error ? "select-error" : undefined
                    )}
                    value={value ?? ""}
                    required={required}
                    disabled={disabled}
                    onChange={handleChange}
                >
                    {placeholder ? <option value="">{t(placeholder)}</option> : null}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {t(option.label)}
                        </option>
                    ))}
                </select>
            </div>

            {error ? (
                <label class="label">
                    <span class="label-text-alt text-error">{t(error)}</span>
                </label>
            ) : hint ? (
                <label class="label">
                    <span class="label-text-alt">{tOptional(hint)}</span>
                </label>
            ) : null}
        </div>
    );
}
