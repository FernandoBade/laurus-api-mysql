"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React from "react";
import { useTranslation } from "react-i18next";

export default function BlankContent() {
  const { t } = useTranslation(["resource-pages"]);

  return (
    <div>
      <PageBreadcrumb pageTitle={t("resource.pages.blank.title")} />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px] text-center">
          <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            {t("resource.pages.blank.cardTitle")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            {t("resource.pages.blank.description")}
          </p>
        </div>
      </div>
    </div>
  );
}
