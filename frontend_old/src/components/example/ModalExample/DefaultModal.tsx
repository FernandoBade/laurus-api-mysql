"use client";
import React from "react";
import ComponentCard from "../../common/ComponentCard";

import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import { useModal } from "@/shared/hooks/useModal";
import { useTranslation } from "react-i18next";

export default function DefaultModal() {
  const { t } = useTranslation(["resource-ui", "resource-common"]);
  const { isOpen, openModal, closeModal } = useModal();
  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModal();
  };
  return (
    <div>
      <ComponentCard title={t("resource.ui.modals.default.title")}>
        <Button size="sm" onClick={openModal}>
          {t("resource.ui.modals.actions.open")}
        </Button>
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[600px] p-5 lg:p-10"
        >
          <h4 className="font-semibold text-gray-800 mb-7 text-title-sm dark:text-white/90">
            {t("resource.ui.modals.default.heading")}
          </h4>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            {t("resource.ui.modals.default.bodyPrimary")}
          </p>
          <p className="mt-5 text-sm leading-6 text-gray-500 dark:text-gray-400">
            {t("resource.ui.modals.default.bodySecondary")}
          </p>
          <div className="flex items-center justify-end w-full gap-3 mt-8">
            <Button size="sm" variant="outline" onClick={closeModal}>
              {t("resource.common.actions.close")}
            </Button>
            <Button size="sm" onClick={handleSave}>
              {t("resource.common.actions.saveChanges")}
            </Button>
          </div>
        </Modal>
      </ComponentCard>
    </div>
  );
}

