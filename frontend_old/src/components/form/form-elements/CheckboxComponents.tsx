"use client";
import React, { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Checkbox from "../input/Checkbox";
import { useTranslation } from "react-i18next";

export default function CheckboxComponents() {
  const { t } = useTranslation(["resource-forms", "resource-common"]);
  const [isChecked, setIsChecked] = useState(false);
  const [isCheckedTwo, setIsCheckedTwo] = useState(true);
  const [isCheckedDisabled, setIsCheckedDisabled] = useState(false);
  return (
    <ComponentCard title={t("resource.forms.checkbox.title")}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Checkbox checked={isChecked} onChange={setIsChecked} />
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-400">
            {t("resource.forms.checkbox.labels.default")}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isCheckedTwo}
            onChange={setIsCheckedTwo}
            label={t("resource.forms.checkbox.labels.checked")}
          />
        </div>
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isCheckedDisabled}
            onChange={setIsCheckedDisabled}
            disabled
            label={t("resource.forms.checkbox.labels.disabled")}
          />
        </div>
      </div>
    </ComponentCard>
  );
}
