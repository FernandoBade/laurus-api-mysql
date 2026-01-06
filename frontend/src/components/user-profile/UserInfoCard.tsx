"use client";
import React from "react";
import { useModal } from "@/shared/hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useTranslation } from "react-i18next";
import { PencilSimpleLine } from "@phosphor-icons/react";

export default function UserInfoCard() {
  const { t } = useTranslation(["resource-profile", "resource-common"]);
  const { isOpen, openModal, closeModal } = useModal();
  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModal();
  };
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            {t("resource.profile.sections.personalInfo")}
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                {t("resource.common.fields.firstName")}
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {t("resource.profile.values.firstName")}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                {t("resource.common.fields.lastName")}
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {t("resource.profile.values.lastName")}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                {t("resource.common.fields.emailAddress")}
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {t("resource.profile.values.email")}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                {t("resource.common.fields.phone")}
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {t("resource.profile.values.phone")}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                {t("resource.common.fields.bio")}
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {t("resource.profile.meta.role")}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <PencilSimpleLine size={18} />
          {t("resource.common.actions.edit")}
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {t("resource.profile.modal.title")}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              {t("resource.profile.modal.subtitle")}
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  {t("resource.profile.modal.sections.socialLinks")}
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>{t("resource.profile.fields.facebook")}</Label>
                    <Input
                      type="text"
                      defaultValue="https://www.facebook.com/PimjoHQ"
                    />
                  </div>

                  <div>
                    <Label>{t("resource.profile.fields.x")}</Label>
                    <Input type="text" defaultValue="https://x.com/PimjoHQ" />
                  </div>

                  <div>
                    <Label>{t("resource.profile.fields.linkedin")}</Label>
                    <Input
                      type="text"
                      defaultValue="https://www.linkedin.com/company/pimjo"
                    />
                  </div>

                  <div>
                    <Label>{t("resource.profile.fields.instagram")}</Label>
                    <Input
                      type="text"
                      defaultValue="https://instagram.com/PimjoHQ"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  {t("resource.profile.modal.sections.personalInfo")}
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>{t("resource.common.fields.firstName")}</Label>
                    <Input type="text" defaultValue={t("resource.profile.values.firstName")} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>{t("resource.common.fields.lastName")}</Label>
                    <Input type="text" defaultValue={t("resource.profile.values.lastName")} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>{t("resource.common.fields.emailAddress")}</Label>
                    <Input type="text" defaultValue={t("resource.profile.values.email")} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>{t("resource.common.fields.phone")}</Label>
                    <Input type="text" defaultValue={t("resource.profile.values.phone")} />
                  </div>

                  <div className="col-span-2">
                    <Label>{t("resource.common.fields.bio")}</Label>
                    <Input type="text" defaultValue={t("resource.profile.meta.role")} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                {t("resource.common.actions.close")}
              </Button>
              <Button size="sm" onClick={handleSave}>
                {t("resource.common.actions.saveChanges")}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
