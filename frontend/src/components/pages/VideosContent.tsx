"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import VideosExample from "@/components/ui/video/VideosExample";
import React from "react";
import { useTranslation } from "react-i18next";

export default function VideosContent() {
  const { t } = useTranslation(["resource-ui"]);

  return (
    <div>
      <PageBreadcrumb pageTitle={t("resource.ui.pages.videos.title")} />
      <VideosExample />
    </div>
  );
}
