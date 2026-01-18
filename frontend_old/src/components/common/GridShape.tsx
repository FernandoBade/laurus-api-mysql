"use client";

import Image from "next/image";
import React from "react";
import { useTranslation } from "react-i18next";

export default function GridShape() {
  const { t } = useTranslation(["resource-common"]);
  return (
    <>
      <div className="absolute right-0 top-0 -z-1 w-full max-w-[250px] xl:max-w-[450px]">
        <Image
          width={540}
          height={254}
          src="/images/shape/grid-01.svg"
          alt={t("resource.common.images.gridAlt")}
        />
      </div>
      <div className="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 xl:max-w-[450px]">
        <Image
          width={540}
          height={254}
          src="/images/shape/grid-01.svg"
          alt={t("resource.common.images.gridAlt")}
        />
      </div>
    </>
  );
}
