"use client";
import React, { useMemo, useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import DatePicker from "@/components/form/date-picker";
import { useTranslation } from "react-i18next";
import { CaretDown, Clock, CreditCard, Eye, EyeClosed } from "@phosphor-icons/react";

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
              <CaretDown size={20} />
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
                <Eye size={20} className="text-gray-500 dark:text-gray-400" />
              ) : (
                <EyeClosed size={20} className="text-gray-500 dark:text-gray-400" />
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
              <Clock size={20} />
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
              <CreditCard size={20} className="text-gray-500 dark:text-gray-400" />
            </span>
          </div>
        </div>
      </div>
    </ComponentCard>
  );
}
