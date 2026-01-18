"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import React from "react";
import { useTranslation } from "react-i18next";

export default function BasicTablesContent() {
  const { t } = useTranslation(["resource-tables"]);

  return (
    <div>
      <PageBreadcrumb pageTitle={t("resource.tables.pages.basic.title")} />
      <div className="space-y-6">
        <ComponentCard title={t("resource.tables.pages.basic.cardTitle")}>
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
}
