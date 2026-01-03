"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Alert from "@/components/ui/alert/Alert";
import React from "react";
import { useTranslation } from "react-i18next";

export default function AlertsContent() {
  const { t } = useTranslation(["resource-ui", "resource-common"]);

  return (
    <div>
      <PageBreadcrumb pageTitle={t("resource.ui.pages.alerts.title")} />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title={t("resource.ui.alerts.success.title")}> 
          <Alert
            variant="success"
            title={t("resource.ui.alerts.success.messageTitle")}
            message={t("resource.ui.alerts.message")}
            showLink={true}
            linkHref="/"
            linkText={t("resource.ui.alerts.linkText")}
          />
          <Alert
            variant="success"
            title={t("resource.ui.alerts.success.messageTitle")}
            message={t("resource.ui.alerts.message")}
            showLink={false}
          />
        </ComponentCard>
        <ComponentCard title={t("resource.ui.alerts.warning.title")}> 
          <Alert
            variant="warning"
            title={t("resource.ui.alerts.warning.messageTitle")}
            message={t("resource.ui.alerts.message")}
            showLink={true}
            linkHref="/"
            linkText={t("resource.ui.alerts.linkText")}
          />
          <Alert
            variant="warning"
            title={t("resource.ui.alerts.warning.messageTitle")}
            message={t("resource.ui.alerts.message")}
            showLink={false}
          />
        </ComponentCard>
        <ComponentCard title={t("resource.ui.alerts.error.title")}> 
          <Alert
            variant="error"
            title={t("resource.ui.alerts.error.messageTitle")}
            message={t("resource.ui.alerts.message")}
            showLink={true}
            linkHref="/"
            linkText={t("resource.ui.alerts.linkText")}
          />
          <Alert
            variant="error"
            title={t("resource.ui.alerts.error.messageTitle")}
            message={t("resource.ui.alerts.message")}
            showLink={false}
          />
        </ComponentCard>
        <ComponentCard title={t("resource.ui.alerts.info.title")}> 
          <Alert
            variant="info"
            title={t("resource.ui.alerts.info.messageTitle")}
            message={t("resource.ui.alerts.message")}
            showLink={true}
            linkHref="/"
            linkText={t("resource.ui.alerts.linkText")}
          />
          <Alert
            variant="info"
            title={t("resource.ui.alerts.info.messageTitle")}
            message={t("resource.ui.alerts.message")}
            showLink={false}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
