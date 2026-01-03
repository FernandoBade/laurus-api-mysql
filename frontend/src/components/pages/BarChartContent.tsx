"use client";

import BarChartOne from "@/components/charts/bar/BarChartOne";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React from "react";
import { useTranslation } from "react-i18next";

export default function BarChartContent() {
  const { t } = useTranslation(["resource-charts"]);

  return (
    <div>
      <PageBreadcrumb pageTitle={t("resource.charts.pages.bar.title")} />
      <div className="space-y-6">
        <ComponentCard title={t("resource.charts.pages.bar.cardTitle")}>
          <BarChartOne />
        </ComponentCard>
      </div>
    </div>
  );
}
