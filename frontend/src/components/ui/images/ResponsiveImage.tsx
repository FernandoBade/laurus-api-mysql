"use client";

import Image from "next/image";
import React from "react";
import { useTranslation } from "react-i18next";

export default function ResponsiveImage() {
  const { t } = useTranslation(["resource-ui", "resource-common"]);
  return (
    <div className="relative">
      <div className="overflow-hidden">
        <Image
          src="/images/grid-image/image-01.png"
          alt={t("resource.ui.images.coverAlt")}
          className="w-full border border-gray-200 rounded-xl dark:border-gray-800"
          width={1054}
          height={600}
        />
      </div>
    </div>
  );
}
