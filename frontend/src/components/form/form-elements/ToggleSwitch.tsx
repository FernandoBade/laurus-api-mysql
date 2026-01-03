"use client";
import React from "react";
import ComponentCard from "../../common/ComponentCard";
import Switch from "../switch/Switch";
import { useTranslation } from "react-i18next";

export default function ToggleSwitch() {
  const { t } = useTranslation(["resource-forms", "resource-common"]);
  const handleSwitchChange = (checked: boolean) => {
    console.log("Switch is now:", checked ? "ON" : "OFF");
  };
  return (
    <ComponentCard title={t("resource.forms.toggleSwitch.title")}>
      <div className="flex gap-4">
        <Switch
          label={t("resource.forms.toggleSwitch.labels.default")}
          defaultChecked={true}
          onChange={handleSwitchChange}
        />
        <Switch
          label={t("resource.forms.toggleSwitch.labels.checked")}
          defaultChecked={true}
          onChange={handleSwitchChange}
        />
        <Switch label={t("resource.forms.toggleSwitch.labels.disabled")} disabled={true} />
      </div>{" "}
      <div className="flex gap-4">
        <Switch
          label={t("resource.forms.toggleSwitch.labels.default")}
          defaultChecked={true}
          onChange={handleSwitchChange}
          color="gray"
        />
        <Switch
          label={t("resource.forms.toggleSwitch.labels.checked")}
          defaultChecked={true}
          onChange={handleSwitchChange}
          color="gray"
        />
        <Switch label={t("resource.forms.toggleSwitch.labels.disabled")} disabled={true} color="gray" />
      </div>
    </ComponentCard>
  );
}
