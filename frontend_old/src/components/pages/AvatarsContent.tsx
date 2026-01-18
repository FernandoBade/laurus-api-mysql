"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Avatar from "@/components/ui/avatar/Avatar";
import React from "react";
import { useTranslation } from "react-i18next";

export default function AvatarsContent() {
  const { t } = useTranslation(["resource-ui"]);

  return (
    <div>
      <PageBreadcrumb pageTitle={t("resource.ui.pages.avatars.title")} />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title={t("resource.ui.avatars.sections.default")}>
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Avatar src="/images/user/user-01.jpg" size="xsmall" />
            <Avatar src="/images/user/user-01.jpg" size="small" />
            <Avatar src="/images/user/user-01.jpg" size="medium" />
            <Avatar src="/images/user/user-01.jpg" size="large" />
            <Avatar src="/images/user/user-01.jpg" size="xlarge" />
            <Avatar src="/images/user/user-01.jpg" size="xxlarge" />
          </div>
        </ComponentCard>
        <ComponentCard title={t("resource.ui.avatars.sections.online")}>
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Avatar src="/images/user/user-01.jpg" size="xsmall" status="online" />
            <Avatar src="/images/user/user-01.jpg" size="small" status="online" />
            <Avatar src="/images/user/user-01.jpg" size="medium" status="online" />
            <Avatar src="/images/user/user-01.jpg" size="large" status="online" />
            <Avatar src="/images/user/user-01.jpg" size="xlarge" status="online" />
            <Avatar src="/images/user/user-01.jpg" size="xxlarge" status="online" />
          </div>
        </ComponentCard>
        <ComponentCard title={t("resource.ui.avatars.sections.offline")}>
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Avatar src="/images/user/user-01.jpg" size="xsmall" status="offline" />
            <Avatar src="/images/user/user-01.jpg" size="small" status="offline" />
            <Avatar src="/images/user/user-01.jpg" size="medium" status="offline" />
            <Avatar src="/images/user/user-01.jpg" size="large" status="offline" />
            <Avatar src="/images/user/user-01.jpg" size="xlarge" status="offline" />
            <Avatar src="/images/user/user-01.jpg" size="xxlarge" status="offline" />
          </div>
        </ComponentCard>
        <ComponentCard title={t("resource.ui.avatars.sections.busy")}>
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Avatar src="/images/user/user-01.jpg" size="xsmall" status="busy" />
            <Avatar src="/images/user/user-01.jpg" size="small" status="busy" />
            <Avatar src="/images/user/user-01.jpg" size="medium" status="busy" />
            <Avatar src="/images/user/user-01.jpg" size="large" status="busy" />
            <Avatar src="/images/user/user-01.jpg" size="xlarge" status="busy" />
            <Avatar src="/images/user/user-01.jpg" size="xxlarge" status="busy" />
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
