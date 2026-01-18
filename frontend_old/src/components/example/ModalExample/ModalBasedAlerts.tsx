"use client";
import React from "react";
import ComponentCard from "../../common/ComponentCard";

import { Modal } from "../../ui/modal";
import { useModal } from "@/shared/hooks/useModal";
import { useTranslation } from "react-i18next";
import { Check, Circle, Info, Warning, X } from "@phosphor-icons/react";

export default function ModalBasedAlerts() {
  const { t } = useTranslation(["resource-ui", "resource-common"]);
  const successModal = useModal();
  const infoModal = useModal();
  const warningModal = useModal();
  const errorModal = useModal();
  return (
    <ComponentCard title={t("resource.ui.modals.alerts.title")}>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={successModal.openModal}
          className="px-4 py-3 text-sm font-medium text-white rounded-lg bg-success-500 shadow-theme-xs hover:bg-success-600"
        >
          {t("resource.ui.modals.alerts.actions.success")}
        </button>
        <button
          onClick={infoModal.openModal}
          className="px-4 py-3 text-sm font-medium text-white rounded-lg bg-blue-light-500 shadow-theme-xs hover:bg-blue-light-600"
        >
          {t("resource.ui.modals.alerts.actions.info")}
        </button>
        <button
          onClick={warningModal.openModal}
          className="px-4 py-3 text-sm font-medium text-white rounded-lg bg-warning-500 shadow-theme-xs hover:bg-warning-600"
        >
          {t("resource.ui.modals.alerts.actions.warning")}
        </button>
        <button
          onClick={errorModal.openModal}
          className="px-4 py-3 text-sm font-medium text-white rounded-lg bg-error-500 shadow-theme-xs hover:bg-error-600"
        >
          {t("resource.ui.modals.alerts.actions.danger")}
        </button>
      </div>
      {/* Success Modal */}
      <Modal
        isOpen={successModal.isOpen}
        onClose={successModal.closeModal}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <div className="text-center">
          <div className="relative flex items-center justify-center z-1 mb-7">
            <Circle
              size={90}
              weight="fill"
              className="text-success-50 dark:text-success-500/15"
            />

            <span className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
              <Check
                size={38}
                weight="bold"
                className="text-success-600 dark:text-success-500"
              />
            </span>
          </div>
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
            {t("resource.ui.modals.alerts.success.heading")}
          </h4>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            {t("resource.ui.modals.alerts.success.body")}
          </p>

          <div className="flex items-center justify-center w-full gap-3 mt-7">
            <button
              type="button"
              className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-success-500 shadow-theme-xs hover:bg-success-600 sm:w-auto"
            >
              {t("resource.ui.modals.alerts.actions.confirm")}
            </button>
          </div>
        </div>
      </Modal>
      {/* Info Modal */}
      <Modal
        isOpen={infoModal.isOpen}
        onClose={infoModal.closeModal}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <div className="text-center">
          <div className="relative flex items-center justify-center z-1 mb-7">
            <Circle
              size={90}
              weight="fill"
              className="text-blue-light-50 dark:text-blue-light-500/15"
            />

            <span className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
              <Info
                size={38}
                weight="bold"
                className="text-blue-light-500 dark:text-blue-light-500"
              />
            </span>
          </div>

          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
            {t("resource.ui.modals.alerts.info.heading")}
          </h4>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            {t("resource.ui.modals.alerts.info.body")}
          </p>

          <div className="flex items-center justify-center w-full gap-3 mt-7">
            <button
              type="button"
              className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-blue-light-500 shadow-theme-xs hover:bg-blue-light-600 sm:w-auto"
            >
              {t("resource.ui.modals.alerts.actions.confirm")}
            </button>
          </div>
        </div>
      </Modal>
      {/* Warning Modal */}
      <Modal
        isOpen={warningModal.isOpen}
        onClose={warningModal.closeModal}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <div className="text-center">
          <div className="relative flex items-center justify-center z-1 mb-7">
            <Circle
              size={90}
              weight="fill"
              className="text-warning-50 dark:text-warning-500/15"
            />

            <span className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
              <Warning
                size={38}
                weight="bold"
                className="text-warning-600 dark:text-orange-400"
              />
            </span>
          </div>

          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
            {t("resource.ui.modals.alerts.warning.heading")}
          </h4>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            {t("resource.ui.modals.alerts.warning.body")}
          </p>

          <div className="flex items-center justify-center w-full gap-3 mt-7">
            <button
              type="button"
              className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-warning-500 shadow-theme-xs hover:bg-warning-600 sm:w-auto"
            >
              {t("resource.ui.modals.alerts.actions.confirm")}
            </button>
          </div>
        </div>
      </Modal>
      {/* Error Modal */}
      <Modal
        isOpen={errorModal.isOpen}
        onClose={errorModal.closeModal}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <div className="text-center">
          <div className="relative flex items-center justify-center z-1 mb-7">
            <Circle
              size={90}
              weight="fill"
              className="text-error-50 dark:text-error-500/15"
            />

            <span className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
              <X
                size={38}
                weight="bold"
                className="text-error-600 dark:text-error-500"
              />
            </span>
          </div>

          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
            {t("resource.ui.modals.alerts.danger.heading")}
          </h4>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            {t("resource.ui.modals.alerts.danger.body")}
          </p>

          <div className="flex items-center justify-center w-full gap-3 mt-7">
            <button
              type="button"
              className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-error-500 shadow-theme-xs hover:bg-error-600 sm:w-auto"
            >
              {t("resource.ui.modals.alerts.actions.confirm")}
            </button>
          </div>
        </div>
      </Modal>
    </ComponentCard>
  );
}

