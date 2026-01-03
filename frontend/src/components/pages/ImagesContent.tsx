"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ResponsiveImage from "@/components/ui/images/ResponsiveImage";
import ThreeColumnImageGrid from "@/components/ui/images/ThreeColumnImageGrid";
import TwoColumnImageGrid from "@/components/ui/images/TwoColumnImageGrid";
import React from "react";
import { useTranslation } from "react-i18next";

export default function ImagesContent() {
  const { t } = useTranslation(["resource-ui"]);

  return (
    <div>
      <PageBreadcrumb pageTitle={t("resource.ui.pages.images.title")} />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title={t("resource.ui.images.sections.responsive")}>
          <ResponsiveImage />
        </ComponentCard>
        <ComponentCard title={t("resource.ui.images.sections.twoColumn")}>
          <TwoColumnImageGrid />
        </ComponentCard>
        <ComponentCard title={t("resource.ui.images.sections.threeColumn")}>
          <ThreeColumnImageGrid />
        </ComponentCard>
      </div>
    </div>
  );
}
