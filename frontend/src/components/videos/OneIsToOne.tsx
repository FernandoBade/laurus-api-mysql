"use client";

import React from "react";
import { useTranslation } from "react-i18next";

export default function OneIsToOne() {
  const { t } = useTranslation(["resource-ui"]);
  return (
    <div className="overflow-hidden rounded-lg aspect-square">
      <iframe
        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
        title={t("resource.ui.videos.youtubeTitle")}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      ></iframe>
    </div>
  );
}
