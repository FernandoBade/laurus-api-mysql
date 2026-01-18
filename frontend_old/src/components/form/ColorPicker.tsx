import React from "react";
import type { CategoryColor } from "@/shared/types/domain";

type ColorOption = {
  value: CategoryColor;
  label: string;
};

type ColorPickerProps = {
  value: CategoryColor;
  options: ColorOption[];
  onChange?: (value: CategoryColor) => void;
  disabled?: boolean;
  ariaLabel?: string;
};

const colorClasses: Record<CategoryColor, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  yellow: "bg-yellow-500",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
  gray: "bg-gray-500",
  cyan: "bg-cyan-500",
  indigo: "bg-indigo-500",
};

const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  options,
  onChange,
  disabled = false,
  ariaLabel,
}) => (
  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={ariaLabel}>
    {options.map((option) => {
      const isSelected = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={isSelected}
          aria-label={option.label}
          title={option.label}
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              onChange?.(option.value);
            }
          }}
          className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/70 transition dark:border-gray-800 ${
            colorClasses[option.value]
          } ${
            isSelected
              ? "ring-2 ring-brand-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
              : "ring-1 ring-gray-200 dark:ring-gray-700"
          } ${disabled ? "cursor-not-allowed opacity-60" : "hover:scale-105"}`}
        >
          <span className="sr-only">{option.label}</span>
        </button>
      );
    })}
  </div>
);

export default ColorPicker;
