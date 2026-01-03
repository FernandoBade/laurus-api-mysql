"use client";

import React from "react";
import YouTubeEmbed from "./YouTubeEmbed";
import ComponentCard from "@/components/common/ComponentCard";
import { useTranslation } from "react-i18next";

export default function VideosExample() {
  const { t } = useTranslation(["resource-ui"]);
  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-2">
        <div className="space-y-5 sm:space-y-6">
          <ComponentCard title={t("resource.ui.videos.ratio16x9")}>
            <YouTubeEmbed videoId="dQw4w9WgXcQ" />
          </ComponentCard>
          <ComponentCard title={t("resource.ui.videos.ratio4x3")}>
            <YouTubeEmbed videoId="dQw4w9WgXcQ" aspectRatio="4:3" />
          </ComponentCard>
        </div>
        <div className="space-y-5 sm:space-y-6">
          <ComponentCard title={t("resource.ui.videos.ratio21x9")}>
            <YouTubeEmbed videoId="dQw4w9WgXcQ" aspectRatio="21:9" />
          </ComponentCard>
          <ComponentCard title={t("resource.ui.videos.ratio1x1")}>
            <YouTubeEmbed videoId="dQw4w9WgXcQ" aspectRatio="1:1" />
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
