"use client";
import React, { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Radio from "../input/Radio";
import { useTranslation } from "react-i18next";

export default function RadioButtons() {
  const { t } = useTranslation(["resource-forms", "resource-common"]);
  const [selectedValue, setSelectedValue] = useState<string>("option2");

  const handleRadioChange = (value: string) => {
    setSelectedValue(value);
  };
  return (
    <ComponentCard title={t("resource.forms.radioButtons.title")}>
      <div className="flex flex-wrap items-center gap-8">
        <Radio
          id="radio1"
          name="group1"
          value="option1"
          checked={selectedValue === "option1"}
          onChange={handleRadioChange}
          label={t("resource.forms.radioButtons.labels.default")}
        />
        <Radio
          id="radio2"
          name="group1"
          value="option2"
          checked={selectedValue === "option2"}
          onChange={handleRadioChange}
          label={t("resource.forms.radioButtons.labels.selected")}
        />
        <Radio
          id="radio3"
          name="group1"
          value="option3"
          checked={selectedValue === "option3"}
          onChange={handleRadioChange}
          label={t("resource.forms.radioButtons.labels.disabled")}
          disabled={true}
        />
      </div>
    </ComponentCard>
  );
}
