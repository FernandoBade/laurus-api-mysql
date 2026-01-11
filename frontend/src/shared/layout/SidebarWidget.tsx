"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import Button from "@/components/ui/button/Button";
import { useModal } from "@/shared/hooks/useModal";
import BetaFeedbackModal from "@/features/beta-feedback/components/BetaFeedbackModal";

export default function SidebarWidget() {
  const { t } = useTranslation(["resource-layout", "resource-common"]);
  const { isOpen, openModal, closeModal } = useModal();
  return (
    <>
      <div
        className={`
          mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03]`}
      >
        <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
          {t("resource.layout.sidebarWidget.title")}
        </h3>
        <p className="mb-4 text-gray-500 text-theme-sm dark:text-gray-400">
          {t("resource.layout.sidebarWidget.description")}
        </p>
        <Button
          size="sm"
          type="button"
          className="w-full text-theme-sm"
          onClick={openModal}
        >
          {t("resource.layout.sidebarWidget.upgrade")}
        </Button>
      </div>
      <BetaFeedbackModal isOpen={isOpen} onClose={closeModal} />
    </>
  );
}
