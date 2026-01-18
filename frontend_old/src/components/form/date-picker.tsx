import { useEffect, useRef } from 'react';
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
  iconPosition?: "left" | "right";
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
  iconPosition = "right",
}: PropsType) {
  const hasLeftIcon = iconPosition === "left";
  const inputClasses = `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800 ${
    hasLeftIcon ? "pl-[56px]" : ""
  }`;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const flatpickrRef = useRef<flatpickr.Instance | null>(null);
  const onChangeRef = useRef<Hook | Hook[] | undefined>(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }
    const options: flatpickr.Options.Options = {
      mode: mode || "single",
      static: staticPosition ?? true,
      monthSelectorType: "static",
      dateFormat: dateFormat ?? "Y-m-d",
      defaultDate,
      onChange: (...args) => {
        const handler = onChangeRef.current;
        if (!handler) {
          return;
        }
        if (Array.isArray(handler)) {
          handler.forEach((fn) => fn(...args));
        } else {
          handler(...args);
        }
      },
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

    const instance = flatpickr(inputRef.current, options);
    flatpickrRef.current = Array.isArray(instance) ? instance[0] : instance;

    return () => {
      flatpickrRef.current?.destroy();
      flatpickrRef.current = null;
    };
  }, [
    mode,
    dateFormat,
    altFormat,
    allowInput,
    appendTo,
    staticPosition,
    inputClasses,
    defaultDate,
  ]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        {hasLeftIcon && (
          <span className="absolute left-0 top-1/2 flex h-11 w-[46px] -translate-y-1/2 items-center justify-center border-r border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400 pointer-events-none">
            <Calendar size={20} />
          </span>
        )}
        <input
          ref={inputRef}
          id={id}
          placeholder={placeholder}
          className={inputClasses}
        />

        {!hasLeftIcon && (
          <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
            <Calendar size={24} />
          </span>
        )}
      </div>
    </div>
  );
}
