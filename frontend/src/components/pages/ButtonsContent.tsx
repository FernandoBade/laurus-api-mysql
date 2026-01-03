"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { BoxIcon } from "@/icons";
import React from "react";
import { useTranslation } from "react-i18next";

export default function ButtonsContent() {
  const { t } = useTranslation(["resource-ui", "resource-common"]);
  return (
    <div>
      <PageBreadcrumb pageTitle={t("resource.ui.pages.buttons.title")} />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title={t("resource.ui.buttons.primary.title")}> 
          <div className="flex items-center gap-5">
            <Button size="sm" variant="primary">
              {t("resource.ui.buttons.label")}
            </Button>
            <Button size="md" variant="primary">
              {t("resource.ui.buttons.label")}
            </Button>
          </div>
        </ComponentCard>
        <ComponentCard title={t("resource.ui.buttons.primaryLeftIcon.title")}> 
          <div className="flex items-center gap-5">
            <Button size="sm" variant="primary" startIcon={<BoxIcon />}>
              {t("resource.ui.buttons.label")}
            </Button>
            <Button size="md" variant="primary" startIcon={<BoxIcon />}>
              {t("resource.ui.buttons.label")}
            </Button>
          </div>
        </ComponentCard>
        <ComponentCard title={t("resource.ui.buttons.primaryRightIcon.title")}> 
          <div className="flex items-center gap-5">
            <Button size="sm" variant="primary" endIcon={<BoxIcon />}>
              {t("resource.ui.buttons.label")}
            </Button>
            <Button size="md" variant="primary" endIcon={<BoxIcon />}>
              {t("resource.ui.buttons.label")}
            </Button>
          </div>
        </ComponentCard>
        <ComponentCard title={t("resource.ui.buttons.secondary.title")}> 
          <div className="flex items-center gap-5">
            <Button size="sm" variant="outline">
              {t("resource.ui.buttons.label")}
            </Button>
            <Button size="md" variant="outline">
              {t("resource.ui.buttons.label")}
            </Button>
          </div>
        </ComponentCard>
        <ComponentCard title={t("resource.ui.buttons.outlineLeftIcon.title")}> 
          <div className="flex items-center gap-5">
            <Button size="sm" variant="outline" startIcon={<BoxIcon />}>
              {t("resource.ui.buttons.label")}
            </Button>
            <Button size="md" variant="outline" startIcon={<BoxIcon />}>
              {t("resource.ui.buttons.label")}
            </Button>
          </div>
        </ComponentCard>
        <ComponentCard title={t("resource.ui.buttons.outlineRightIcon.title")}> 
          <div className="flex items-center gap-5">
            <Button size="sm" variant="outline" endIcon={<BoxIcon />}>
              {t("resource.ui.buttons.label")}
            </Button>
            <Button size="md" variant="outline" endIcon={<BoxIcon />}>
              {t("resource.ui.buttons.label")}
            </Button>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
