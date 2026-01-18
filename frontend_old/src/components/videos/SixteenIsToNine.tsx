"use client";

import React from "react";
import { useTranslation } from "react-i18next";

export default function SixteenIsToNine() {
  const { t } = useTranslation(["resource-ui"]);
  return (
    <div className="aspect-4/3 overflow-hidden rounded-lg">
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
