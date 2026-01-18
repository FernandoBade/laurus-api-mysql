"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import UserProfile from "@/features/users/components/UserProfile";

export default function ProfilePage() {
  const { t } = useTranslation(["resource-profile"]);

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          {t("resource.profile.title")}
        </h3>
        <UserProfile />
      </div>
    </div>
  );
}
