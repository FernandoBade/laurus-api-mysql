"use client";
import React, { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import TextArea from "../input/TextArea";
import Label from "../Label";
import { useTranslation } from "react-i18next";

export default function TextAreaInput() {
  const { t } = useTranslation(["resource-forms", "resource-common"]);
  const [message, setMessage] = useState("");
  const [messageTwo, setMessageTwo] = useState("");
  return (
    <ComponentCard title={t("resource.forms.textArea.title")}>
      <div className="space-y-6">
        {/* Default TextArea */}
        <div>
          <Label>{t("resource.common.fields.description")}</Label>
          <TextArea
            value={message}
            onChange={(value) => setMessage(value)}
            rows={6}
          />
        </div>

        {/* Disabled TextArea */}
        <div>
          <Label>{t("resource.common.fields.description")}</Label>
          <TextArea rows={6} disabled />
        </div>

        {/* Error TextArea */}
        <div>
          <Label>{t("resource.common.fields.description")}</Label>
          <TextArea
            rows={6}
            value={messageTwo}
            error
            onChange={(value) => setMessageTwo(value)}
            hint={t("resource.forms.textArea.hints.invalid")}
          />
        </div>
      </div>
    </ComponentCard>
  );
}
