"use client";
import React, { useMemo, useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import { ChevronDownIcon, EyeCloseIcon, EyeIcon, TimeIcon } from "../../../icons";
import DatePicker from "@/components/form/date-picker";
import { useTranslation } from "react-i18next";

export default function DefaultInputs() {
  const { t } = useTranslation(["resource-forms", "resource-common"]);
  const [showPassword, setShowPassword] = useState(false);
  const options = useMemo(
    () => [
      { value: "marketing", label: t("resource.forms.defaultInputs.options.marketing") },
      { value: "template", label: t("resource.forms.defaultInputs.options.template") },
      { value: "development", label: t("resource.forms.defaultInputs.options.development") },
    ],
    [t]
  );
  const handleSelectChange = (value: string) => {
    console.log("Selected value:", value);
  };
  return (
    <ComponentCard title={t("resource.forms.defaultInputs.title")}>
      <div className="space-y-6">
        <div>
          <Label>{t("resource.forms.defaultInputs.fields.input")}</Label>
          <Input type="text" />
        </div>
        <div>
          <Label>{t("resource.forms.defaultInputs.fields.inputWithPlaceholder")}</Label>
          <Input type="text" placeholder={t("resource.forms.defaultInputs.placeholders.email")} />
        </div>
        <div>
          <Label>{t("resource.forms.defaultInputs.fields.selectInput")}</Label>
          <div className="relative">
            <Select
            options={options}
            placeholder={t("resource.common.placeholders.selectOption")}
            onChange={handleSelectChange}
            className="dark:bg-dark-900"
          />
             <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <ChevronDownIcon/>
            </span>
          </div>
        </div>
        <div>
          <Label>{t("resource.forms.defaultInputs.fields.password")}</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={t("resource.forms.defaultInputs.placeholders.password")}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              aria-label={t("resource.forms.defaultInputs.actions.togglePassword")}
            >
              {showPassword ? (
                <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
              ) : (
                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
              )}
            </button>
          </div>
        </div>

        <div>
          <DatePicker
            id="date-picker"
            label={t("resource.forms.defaultInputs.fields.datePicker")}
            placeholder={t("resource.forms.defaultInputs.placeholders.date")}
            onChange={(dates, currentDateString) => {
              // Handle your logic
              console.log({ dates, currentDateString });
            }}
          />
        </div>

        <div>
          <Label htmlFor="tm">{t("resource.forms.defaultInputs.fields.timePicker")}</Label>
          <div className="relative">
            <Input
              type="time"
              id="tm"
              name="tm"
              onChange={(e) => console.log(e.target.value)}
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <TimeIcon />
            </span>
          </div>
        </div>
        <div>
          <Label htmlFor="tm">{t("resource.forms.defaultInputs.fields.paymentInput")}</Label>
          <div className="relative">
            <Input
              type="text"
              placeholder={t("resource.forms.defaultInputs.placeholders.cardNumber")}
              className="pl-[62px]"
            />
            <span className="absolute left-0 top-1/2 flex h-11 w-[46px] -translate-y-1/2 items-center justify-center border-r border-gray-200 dark:border-gray-800">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="6.25" cy="10" r="5.625" fill="#E80B26" />
                <circle cx="13.75" cy="10" r="5.625" fill="#F59D31" />
                <path
                  d="M10 14.1924C11.1508 13.1625 11.875 11.6657 11.875 9.99979C11.875 8.33383 11.1508 6.8371 10 5.80713C8.84918 6.8371 8.125 8.33383 8.125 9.99979C8.125 11.6657 8.84918 13.1625 10 14.1924Z"
                  fill="#FC6020"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </ComponentCard>
  );
}
