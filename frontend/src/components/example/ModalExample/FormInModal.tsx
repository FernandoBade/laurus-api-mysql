"use client";
import React from "react";
import ComponentCard from "../../common/ComponentCard";
import Button from "../../ui/button/Button";
import { Modal } from "../../ui/modal";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import { useModal } from "@/shared/hooks/useModal";
import { useTranslation } from "react-i18next";

export default function FormInModal() {
  const { t } = useTranslation(["resource-ui", "resource-common"]);
  const { isOpen, openModal, closeModal } = useModal();
  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModal();
  };
  return (
    <ComponentCard title={t("resource.ui.modals.form.title")}>
      <Button size="sm" onClick={openModal}>
        {t("resource.ui.modals.actions.open")}
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[584px] p-5 lg:p-10"
      >
        <form className="">
          <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
            {t("resource.ui.modals.form.sectionTitle")}
          </h4>

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div className="col-span-1">
              <Label>{t("resource.common.fields.firstName")}</Label>
              <Input
                type="text"
                placeholder={t("resource.ui.modals.form.placeholders.firstName")}
              />
            </div>

            <div className="col-span-1">
              <Label>{t("resource.common.fields.lastName")}</Label>
              <Input
                type="text"
                placeholder={t("resource.ui.modals.form.placeholders.lastName")}
              />
            </div>

            <div className="col-span-1">
              <Label>{t("resource.common.fields.email")}</Label>
              <Input
                type="email"
                placeholder={t("resource.ui.modals.form.placeholders.email")}
              />
            </div>

            <div className="col-span-1">
              <Label>{t("resource.common.fields.phone")}</Label>
              <Input
                type="text"
                placeholder={t("resource.ui.modals.form.placeholders.phone")}
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <Label>{t("resource.common.fields.bio")}</Label>
              <Input
                type="text"
                placeholder={t("resource.ui.modals.form.placeholders.bio")}
              />
            </div>
          </div>

          <div className="flex items-center justify-end w-full gap-3 mt-6">
            <Button size="sm" variant="outline" onClick={closeModal}>
              {t("resource.common.actions.close")}
            </Button>
            <Button size="sm" onClick={handleSave}>
              {t("resource.common.actions.saveChanges")}
            </Button>
          </div>
        </form>
      </Modal>
    </ComponentCard>
  );
}

