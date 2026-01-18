"use client";
import React from "react";
import ComponentCard from "../../common/ComponentCard";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { UploadSimple } from "@phosphor-icons/react";

const DropzoneComponent: React.FC = () => {
  const { t } = useTranslation(["resource-forms", "resource-common"]);
  const onDrop = (acceptedFiles: File[]) => {
    console.log("Files dropped:", acceptedFiles);
    // Handle file uploads here
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/svg+xml": [],
    },
  });
  return (
    <ComponentCard title={t("resource.forms.dropzone.title")}>
      <div className="transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500">
        <form
          {...getRootProps()}
          className={`dropzone rounded-xl   border-dashed border-gray-300 p-7 lg:p-10
        ${
          isDragActive
            ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
            : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
        }
      `}
          id="demo-upload"
        >
          {/* Hidden Input */}
          <input {...getInputProps()} />

          <div className="dz-message flex flex-col items-center m-0!">
            {/* Icon Container */}
            <div className="mb-[22px] flex justify-center">
              <div className="flex h-[68px] w-[68px]  items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                <UploadSimple size={28} />
              </div>
            </div>

            {/* Text Content */}
            <h4 className="mb-3 font-semibold text-gray-800 text-theme-xl dark:text-white/90">
              {isDragActive
                ? t("resource.forms.dropzone.activeTitle")
                : t("resource.forms.dropzone.idleTitle")}
            </h4>

            <span className=" text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
              {t("resource.forms.dropzone.subtitle")}
            </span>

            <span className="font-medium underline text-theme-sm text-brand-500">
              {t("resource.forms.dropzone.browse")}
            </span>
          </div>
        </form>
      </div>
    </ComponentCard>
  );
};

export default DropzoneComponent;
