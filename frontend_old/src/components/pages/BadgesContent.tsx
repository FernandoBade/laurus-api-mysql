"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import React from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "@phosphor-icons/react";

const badgeColors = [
  "primary",
  "success",
  "error",
  "warning",
  "info",
  "light",
  "dark",
] as const;

type BadgeColor = (typeof badgeColors)[number];

type BadgeVariant = "light" | "solid";

type IconPosition = "none" | "left" | "right";

export default function BadgesContent() {
  const { t } = useTranslation(["resource-ui", "resource-common"]);

  const badgeLabel = (color: BadgeColor) =>
    t(`resource.common.badges.${color}`);

  const renderBadges = (variant: BadgeVariant, iconPosition: IconPosition) =>
    badgeColors.map((color) => (
      <Badge
        key={`${variant}-${iconPosition}-${color}`}
        variant={variant}
        color={color}
        startIcon={iconPosition === "left" ? <Plus size={14} /> : undefined}
        endIcon={iconPosition === "right" ? <Plus size={14} /> : undefined}
      >
        {badgeLabel(color)}
      </Badge>
    ));

  return (
    <div>
      <PageBreadcrumb pageTitle={t("resource.ui.pages.badges.title")} />
      <div className="space-y-5 sm:space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              {t("resource.ui.badges.sections.lightBackground")}
            </h3>
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 xl:p-10">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              {renderBadges("light", "none")}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              {t("resource.ui.badges.sections.solidBackground")}
            </h3>
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 xl:p-10">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              {renderBadges("solid", "none")}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              {t("resource.ui.badges.sections.lightLeftIcon")}
            </h3>
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 xl:p-10">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              {renderBadges("light", "left")}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              {t("resource.ui.badges.sections.solidLeftIcon")}
            </h3>
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 xl:p-10">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              {renderBadges("solid", "left")}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              {t("resource.ui.badges.sections.lightRightIcon")}
            </h3>
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 xl:p-10">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              {renderBadges("light", "right")}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              {t("resource.ui.badges.sections.solidRightIcon")}
            </h3>
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 xl:p-10">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              {renderBadges("solid", "right")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
