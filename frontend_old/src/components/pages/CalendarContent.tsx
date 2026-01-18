"use client";

import Calendar from "@/components/calendar/Calendar";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React from "react";
import { useTranslation } from "react-i18next";

export default function CalendarContent() {
  const { t } = useTranslation(["resource-calendar"]);

  return (
    <div>
      <PageBreadcrumb pageTitle={t("resource.calendar.page.title")} />
      <Calendar />
    </div>
  );
}
