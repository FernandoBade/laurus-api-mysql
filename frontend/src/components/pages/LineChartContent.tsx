"use client";

import LineChartOne from "@/components/charts/line/LineChartOne";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React from "react";
import { useTranslation } from "react-i18next";

export default function LineChartContent() {
  const { t } = useTranslation(["resource-charts"]);

  return (
    <div>
      <PageBreadcrumb pageTitle={t("resource.charts.pages.line.title")} />
      <div className="space-y-6">
        <ComponentCard title={t("resource.charts.pages.line.cardTitle")}>
          <LineChartOne />
        </ComponentCard>
      </div>
    </div>
  );
}
