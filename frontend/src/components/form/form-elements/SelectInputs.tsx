"use client";
import React, { useMemo, useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Select from "../Select";
import MultiSelect from "../MultiSelect";
import { ChevronDownIcon } from "@/icons";
import { useTranslation } from "react-i18next";

export default function SelectInputs() {
  const { t } = useTranslation(["resource-forms", "resource-common"]);
  const options = useMemo(
    () => [
      { value: "marketing", label: t("resource.forms.selectInputs.options.marketing") },
      { value: "template", label: t("resource.forms.selectInputs.options.template") },
      { value: "development", label: t("resource.forms.selectInputs.options.development") },
    ],
    [t]
  );

  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const handleSelectChange = (value: string) => {
    console.log("Selected value:", value);
  };

  const multiOptions = useMemo(
    () => [
      { value: "1", text: t("resource.forms.selectInputs.multiOptions.option1"), selected: false },
      { value: "2", text: t("resource.forms.selectInputs.multiOptions.option2"), selected: false },
      { value: "3", text: t("resource.forms.selectInputs.multiOptions.option3"), selected: false },
      { value: "4", text: t("resource.forms.selectInputs.multiOptions.option4"), selected: false },
      { value: "5", text: t("resource.forms.selectInputs.multiOptions.option5"), selected: false },
    ],
    [t]
  );

  return (
    <ComponentCard title={t("resource.forms.selectInputs.title")}>
      <div className="space-y-6">
        <div>
          <Label>{t("resource.forms.selectInputs.fields.selectInput")}</Label>
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
        <div className="relative">
          <MultiSelect
            label={t("resource.forms.selectInputs.fields.multiSelect")}
            options={multiOptions}
            defaultSelected={["1", "3"]}
            onChange={(values) => setSelectedValues(values)}
          />
          <p className="sr-only">
            {t("resource.forms.selectInputs.selectedValues")}:{" "}
            {selectedValues.join(", ")}
          </p>
        </div>
      </div>
    </ComponentCard>
  );
}
