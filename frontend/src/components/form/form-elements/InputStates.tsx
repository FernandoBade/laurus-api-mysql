"use client";
import React, { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Input from "../input/InputField";
import Label from "../Label";
import { useTranslation } from "react-i18next";

export default function InputStates() {
  const { t } = useTranslation(["resource-forms", "resource-common"]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);

  // Simulate a validation check
  const validateEmail = (value: string) => {
    const isValidEmail =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    setError(!isValidEmail);
    return isValidEmail;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };
  return (
    <ComponentCard
      title={t("resource.forms.inputStates.title")}
      desc={t("resource.forms.inputStates.desc")}
    >
      <div className="space-y-5 sm:space-y-6">
        {/* Error Input */}
        <div>
          <Label>{t("resource.common.fields.email")}</Label>
          <Input
            type="email"
            defaultValue={email}
            error={error}
            onChange={handleEmailChange}
            placeholder={t("resource.forms.inputStates.placeholders.email")}
            hint={
              error ? t("resource.forms.inputStates.hints.invalidEmail") : ""
            }
          />
        </div>

        {/* Success Input */}
        <div>
          <Label>{t("resource.common.fields.email")}</Label>
          <Input
            type="email"
            defaultValue={email}
            success={!error}
            onChange={handleEmailChange}
            placeholder={t("resource.forms.inputStates.placeholders.email")}
            hint={!error ? t("resource.forms.inputStates.hints.validEmail") : ""}
          />
        </div>

        {/* Disabled Input */}
        <div>
          <Label>{t("resource.common.fields.email")}</Label>
          <Input
            type="text"
            defaultValue={t("resource.forms.inputStates.values.disabledEmail")}
            disabled={true}
            placeholder={t("resource.forms.inputStates.placeholders.disabledEmail")}
            hint={t("resource.forms.inputStates.hints.disabledField")}
          />
        </div>
      </div>
    </ComponentCard>
  );
}
