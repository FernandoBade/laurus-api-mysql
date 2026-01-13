import { useEffect } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Label from './Label';
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;
import { Calendar } from '@phosphor-icons/react';

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
  dateFormat?: string;
  altFormat?: string;
  allowInput?: boolean;
  appendTo?: HTMLElement;
  staticPosition?: boolean;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
  dateFormat,
  altFormat,
  allowInput,
  appendTo,
  staticPosition,
}: PropsType) {
  useEffect(() => {
    const inputClasses =
      "h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800";
    const options: flatpickr.Options.Options = {
      mode: mode || "single",
      static: staticPosition ?? true,
      monthSelectorType: "static",
      dateFormat: dateFormat ?? "Y-m-d",
      defaultDate,
      onChange,
    };
    if (altFormat) {
      options.altInput = true;
      options.altFormat = altFormat;
      options.altInputClass = inputClasses;
    }
    if (allowInput) {
      options.allowInput = true;
    }
    if (appendTo) {
      options.appendTo = appendTo;
    }

    const flatPickr = flatpickr(`#${id}`, options);

    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [
    mode,
    onChange,
    id,
    defaultDate,
    dateFormat,
    altFormat,
    allowInput,
    appendTo,
    staticPosition,
  ]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <Calendar size={24} />
        </span>
      </div>
    </div>
  );
}
