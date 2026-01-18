"use client";
import React from "react";
import ComponentCard from "../../common/ComponentCard";
import FileInput from "../input/FileInput";
import Label from "../Label";
import { useTranslation } from "react-i18next";

export default function FileInputExample() {
  const { t } = useTranslation(["resource-forms", "resource-common"]);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected file:", file.name);
    }
  };

  return (
    <ComponentCard title={t("resource.forms.fileInput.title")}>
      <div>
        <Label>{t("resource.forms.fileInput.label")}</Label>
        <FileInput onChange={handleFileChange} className="custom-class" />
      </div>
    </ComponentCard>
  );
}
