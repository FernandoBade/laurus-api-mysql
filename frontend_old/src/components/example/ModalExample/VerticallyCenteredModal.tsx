"use client";
import React from "react";
import ComponentCard from "../../common/ComponentCard";
import Button from "../../ui/button/Button";
import { Modal } from "../../ui/modal";
import { useModal } from "@/shared/hooks/useModal";
import { useTranslation } from "react-i18next";

export default function VerticallyCenteredModal() {
  const { t } = useTranslation(["resource-ui", "resource-common"]);
  const { isOpen, openModal, closeModal } = useModal();
  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModal();
  };
  return (
    <ComponentCard title={t("resource.ui.modals.centered.title")}>
      <Button size="sm" onClick={openModal}>
        {t("resource.ui.modals.actions.open")}
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        showCloseButton={false}
        className="max-w-[507px] p-6 lg:p-10"
      >
        <div className="text-center">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
            {t("resource.ui.modals.centered.heading")}
          </h4>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            {t("resource.ui.modals.centered.body")}
          </p>

          <div className="flex items-center justify-center w-full gap-3 mt-8">
            <Button size="sm" variant="outline" onClick={closeModal}>
              {t("resource.common.actions.close")}
            </Button>
            <Button size="sm" onClick={handleSave}>
              {t("resource.common.actions.saveChanges")}
            </Button>
          </div>
        </div>
      </Modal>
    </ComponentCard>
  );
}

