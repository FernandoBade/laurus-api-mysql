"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useAuthSession } from "@/features/auth/context";
import { useTheme } from "@/shared/context/ThemeContext";
import { useUpdateUser, useUploadAvatar, useUser } from "@/features/users/hooks";
import {
  getResourceLanguage,
  resourceLanguageOptions,
  setResourceLanguage,
  type ResourceLanguage,
} from "@/shared/i18n";
import { useModal } from "@/shared/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { getApiErrorMessage } from "@/shared/lib/api/errors";
import type { ProfileFormState, ProfileSection } from "@/features/users/types";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/pjpeg",
  "image/x-png",
]);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const padDatePart = (value: number) => String(value).padStart(2, "0");

const parseDateParts = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return {
      year: Number(isoMatch[1]),
      month: Number(isoMatch[2]),
      day: Number(isoMatch[3]),
    };
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return {
    year: parsed.getFullYear(),
    month: parsed.getMonth() + 1,
    day: parsed.getDate(),
  };
};

const formatDateForPreference = (
  value: string | null | undefined,
  format: ProfileFormState["dateFormat"]
) => {
  const parts = parseDateParts(value);
  if (!parts) {
    return "";
  }
  const day = padDatePart(parts.day);
  const month = padDatePart(parts.month);
  const year = parts.year;
  if (format === "MM/DD/YYYY") {
    return `${month}/${day}/${year}`;
  }
  return `${day}/${month}/${year}`;
};

const formatDateInputByPreference = (
  value: string,
  _format: ProfileFormState["dateFormat"]
) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const part1 = digits.slice(0, 2);
  const part2 = digits.slice(2, 4);
  const part3 = digits.slice(4, 8);
  return [part1, part2, part3].filter(Boolean).join("/");
};

const isValidDateParts = (year: number, month: number, day: number) => {
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const parseDateFromPreference = (
  value: string,
  format: ProfileFormState["dateFormat"]
) => {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return null;
  }
  const first = Number(match[1]);
  const second = Number(match[2]);
  const year = Number(match[3]);
  const month = format === "MM/DD/YYYY" ? first : second;
  const day = format === "MM/DD/YYYY" ? second : first;
  if (!isValidDateParts(year, month, day)) {
    return null;
  }
  return `${year}-${padDatePart(month)}-${padDatePart(day)}`;
};

const formatPhoneInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (!digits) {
    return "";
  }
  if (digits.length <= 10) {
    const part1 = digits.slice(0, 2);
    const part2 = digits.slice(2, 6);
    const part3 = digits.slice(6);
    if (!part3) {
      return `(${part1}) ${part2}`.trim();
    }
    return `(${part1}) ${part2}-${part3}`.trim();
  }
  const part1 = digits.slice(0, 2);
  const part2 = digits.slice(2, 7);
  const part3 = digits.slice(7);
  return `(${part1}) ${part2}-${part3}`.trim();
};

const formatPhoneDisplay = (value: string | null | undefined) => {
  if (!value) {
    return "";
  }
  return formatPhoneInput(value);
};

const getProfileLabel = (value: string | null | undefined) => {
  if (!value) {
    return "";
  }
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

const getInitials = (
  firstName?: string | null,
  lastName?: string | null
) => {
  const firstInitial = firstName?.trim().charAt(0) ?? "";
  const lastInitial = lastName?.trim().charAt(0) ?? "";
  const initials = `${firstInitial}${lastInitial}`.toUpperCase();
  return initials || "";
};

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-4 dark:border-gray-800 dark:bg-gray-900/40">
    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white/90">
      {value}
    </p>
  </div>
);

export default function UserProfile() {
  const { t } = useTranslation([
    "resource-profile",
    "resource-common",
    "resource-layout",
    "resource-forms",
  ]);
  const { userId } = useAuthSession();
  const { theme, setTheme } = useTheme();
  const { data: userResponse } = useUser(userId);
  const updateUserMutation = useUpdateUser(userId);
  const uploadAvatarMutation = useUploadAvatar(userId);
  const { isOpen, openModal, closeModal } = useModal();
  const user = userResponse?.data;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeSection, setActiveSection] =
    useState<ProfileSection>("account");
  const [editSection, setEditSection] =
    useState<ProfileSection>("account");
  const [formState, setFormState] = useState<ProfileFormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    theme: "light",
    language: "pt-BR",
    dateFormat: "DD/MM/YYYY",
    currency: "BRL",
    hideValues: false,
  });
  const [selectKey, setSelectKey] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const emptyValue = t("resource.common.placeholders.emptyValue");
  const currentLanguage = getResourceLanguage();

  const languageOptions = useMemo(
    () =>
      resourceLanguageOptions.map((option) => ({
        value: option.value,
        label: t(option.labelKey),
      })),
    [t]
  );

  const themeOptions = useMemo(
    () => [
      { value: "light", label: t("resource.common.badges.light") },
      { value: "dark", label: t("resource.common.badges.dark") },
    ],
    [t]
  );

  const dateFormatOptions = useMemo(
    () => [
      { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
      { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
    ],
    []
  );

  const currencyOptions = useMemo(
    () => [
      { value: "BRL", label: "BRL" },
      { value: "USD", label: "USD" },
      { value: "EUR", label: "EUR" },
      { value: "ARS", label: "ARS" },
      { value: "COP", label: "COP" },
    ],
    []
  );

  const fullName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ");
  const displayName =
    fullName ||
    (userId
      ? t("resource.layout.userMenu.userWithId", { id: userId })
      : t("resource.layout.userMenu.user"));
  const profileLabel = getProfileLabel(user?.profile) || emptyValue;
  const initials = getInitials(user?.firstName, user?.lastName);
  const fallbackInitial = displayName.trim().charAt(0).toUpperCase();
  const preferredDateFormat = (user?.dateFormat ??
    "DD/MM/YYYY") as ProfileFormState["dateFormat"];

  const avatarSrc = avatarPreview || user?.avatarUrl || "";

  useEffect(() => {
    if (user?.theme && user.theme !== theme) {
      setTheme(user.theme);
    }
  }, [user?.theme, theme, setTheme]);

  useEffect(() => {
    if (user?.language && user.language !== currentLanguage) {
      void setResourceLanguage(user.language);
    }
  }, [user?.language, currentLanguage]);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const openEditModal = (section: ProfileSection) => {
    setEditSection(section);
    const nextState: ProfileFormState = {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      phone: formatPhoneDisplay(user?.phone) ?? "",
      birthDate: formatDateForPreference(user?.birthDate, preferredDateFormat),
      theme: (user?.theme ?? theme) as ProfileFormState["theme"],
      language: (user?.language ?? currentLanguage) as ResourceLanguage,
      dateFormat: (user?.dateFormat ??
        "DD/MM/YYYY") as ProfileFormState["dateFormat"],
      currency: (user?.currency ??
        "BRL") as ProfileFormState["currency"],
      hideValues: Boolean(user?.hideValues),
    };
    setFormState(nextState);
    setFormError(null);
    setSelectKey((prev) => prev + 1);
    openModal();
  };

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!ALLOWED_AVATAR_TYPES.has(file.type) || file.size > MAX_AVATAR_BYTES) {
      setAvatarError(t("resource.common.errors.updateFailed"));
      setSelectedAvatar(null);
      setAvatarPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarError(null);
    setSelectedAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = () => {
    if (!selectedAvatar) {
      return;
    }
    uploadAvatarMutation.mutate(selectedAvatar, {
      onSuccess: () => {
        setSelectedAvatar(null);
        setAvatarPreview(null);
        setAvatarError(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
      onError: (error) => {
        setAvatarError(
          getApiErrorMessage(error, t("resource.common.errors.updateFailed"))
        );
      },
    });
  };

  const handleAvatarReset = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setSelectedAvatar(null);
    setAvatarPreview(null);
    setAvatarError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleProfileSave = async () => {
    if (!userId) {
      return;
    }
    if (editSection === "account") {
      if (formState.email && !EMAIL_REGEX.test(formState.email)) {
        setFormError(t("resource.common.errors.updateFailed"));
        return;
      }
      if (
        formState.birthDate &&
        !parseDateFromPreference(formState.birthDate, preferredDateFormat)
      ) {
        setFormError(t("resource.common.errors.updateFailed"));
        return;
      }
    }
    setFormError(null);

    try {
      if (editSection === "account") {
        const parsedBirthDate = formState.birthDate
          ? parseDateFromPreference(formState.birthDate, preferredDateFormat)
          : null;
        await updateUserMutation.mutateAsync({
          id: userId,
          payload: {
            firstName: formState.firstName || undefined,
            lastName: formState.lastName || undefined,
            email: formState.email || undefined,
            phone: formState.phone || undefined,
            birthDate: parsedBirthDate ?? undefined,
          },
        });
      } else {
        await updateUserMutation.mutateAsync({
          id: userId,
          payload: {
            theme: formState.theme,
            language: formState.language,
            dateFormat: formState.dateFormat,
            currency: formState.currency,
            hideValues: formState.hideValues,
          },
        });

        if (formState.theme !== theme) {
          setTheme(formState.theme);
        }
        if (formState.language !== currentLanguage) {
          await setResourceLanguage(formState.language);
        }
      }

      closeModal();
    } catch {
      setFormError(t("resource.common.errors.updateFailed"));
    }
  };

  const handleInputChange = (field: keyof ProfileFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(event.target.value);
    setFormState((prev) => ({ ...prev, phone: formatted }));
  };

  const handleBirthDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const formatted = formatDateInputByPreference(
      event.target.value,
      preferredDateFormat
    );
    setFormState((prev) => ({ ...prev, birthDate: formatted }));
  };

  const sections = [
    { id: "account" as const, label: t("resource.common.fields.account") },
    {
      id: "preferences" as const,
      label: t("resource.profile.sections.preferences"),
    },
  ];

  const emailInvalid =
    editSection === "account" &&
    Boolean(formState.email) &&
    !EMAIL_REGEX.test(formState.email);
  const birthDateInvalid =
    editSection === "account" &&
    Boolean(formState.birthDate) &&
    !parseDateFromPreference(formState.birthDate, preferredDateFormat);

  const renderProfileHeader = (onEdit: () => void) => (
    <div className="flex flex-col gap-6 rounded-2xl border border-gray-200 p-5 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={t("resource.profile.meta.avatarAlt")}
              className="h-full w-full object-cover"
              width={80}
              height={80}
              unoptimized
            />
          ) : (
            <span className="text-lg font-semibold text-gray-600 dark:text-gray-200">
              {initials || fallbackInitial || "?"}
            </span>
          )}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {displayName}
          </p>
          <div className="mt-2">
            <Badge variant="light" color="primary" size="sm">
              {profileLabel}
            </Badge>
          </div>
        </div>
      </div>
      <Button size="sm" onClick={onEdit}>
        {t("resource.common.actions.edit")}
      </Button>
    </div>
  );

  const modalTitle =
    editSection === "account"
      ? t("resource.profile.modal.title")
      : t("resource.profile.sections.preferences");

  return (
    <>
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="lg:w-60">
          <div className="flex flex-col gap-2">
            {sections.map((section) => {
              const isActive = section.id === activeSection;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-500 text-white shadow-theme-xs"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                  }`}
                >
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1">
          {activeSection === "account" && (
            <div className="space-y-6">
              {renderProfileHeader(() => openEditModal("account"))}

              <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <Label>{t("resource.forms.fileInput.label")}</Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("resource.profile.labels.avatarHint")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleAvatarSelect}
                      className="hidden"
                    />
                    <Button
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadAvatarMutation.isPending}
                    >
                      {t("resource.profile.actions.uploadAvatar")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAvatarReset}
                      disabled={!selectedAvatar}
                    >
                      {t("resource.profile.actions.resetAvatar")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAvatarUpload}
                      disabled={!selectedAvatar || uploadAvatarMutation.isPending}
                    >
                      {uploadAvatarMutation.isPending
                        ? t("resource.common.actions.saving")
                        : t("resource.common.actions.saveChanges")}
                    </Button>
                  </div>
                </div>
                {avatarError && (
                  <p className="mt-2 text-xs text-error-500">
                    {avatarError}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
                <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                  {t("resource.profile.sections.personalInfo")}
                </h4>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <DetailItem
                    label={t("resource.common.fields.firstName")}
                    value={user?.firstName || emptyValue}
                  />
                  <DetailItem
                    label={t("resource.common.fields.lastName")}
                    value={user?.lastName || emptyValue}
                  />
                  <DetailItem
                    label={t("resource.common.fields.emailAddress")}
                    value={user?.email || emptyValue}
                  />
                  <DetailItem
                    label={t("resource.common.fields.phone")}
                    value={formatPhoneDisplay(user?.phone) || emptyValue}
                  />
                  <DetailItem
                    label={t("resource.profile.labels.birthDate")}
                    value={
                      formatDateForPreference(
                        user?.birthDate,
                        preferredDateFormat
                      ) || emptyValue
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === "preferences" && (
            <div className="space-y-6">
              {renderProfileHeader(() => openEditModal("preferences"))}
              <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
                <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                  {t("resource.profile.sections.preferences")}
                </h4>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <DetailItem
                    label={t("resource.profile.labels.theme")}
                    value={
                      user?.theme
                        ? t(
                            user.theme === "dark"
                              ? "resource.common.badges.dark"
                              : "resource.common.badges.light"
                          )
                        : emptyValue
                    }
                  />
                  <DetailItem
                    label={t("resource.profile.labels.language")}
                    value={
                      languageOptions.find(
                        (option) => option.value === user?.language
                      )?.label ?? emptyValue
                    }
                  />
                  <DetailItem
                    label={t("resource.profile.labels.dateFormat")}
                    value={user?.dateFormat || emptyValue}
                  />
                  <DetailItem
                    label={t("resource.profile.labels.currency")}
                    value={user?.currency || emptyValue}
                  />
                  <DetailItem
                    label={t("resource.profile.labels.hideValues")}
                    value={
                      user
                        ? user.hideValues
                          ? t("resource.common.status.active")
                          : t("resource.common.status.inactive")
                        : emptyValue
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[800px] m-4">
        <div className="no-scrollbar relative w-full max-w-[800px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-10">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {modalTitle}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              {t("resource.profile.modal.subtitle")}
            </p>
          </div>
          <div className="flex flex-col">
            <div className="custom-scrollbar max-h-[520px] overflow-y-auto px-2 pb-3">
              {editSection === "account" ? (
                <div>
                  <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                    {t("resource.profile.sections.personalInfo")}
                  </h5>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div>
                      <Label>{t("resource.common.fields.firstName")}</Label>
                      <Input
                        type="text"
                        value={formState.firstName}
                        onChange={(event) =>
                          handleInputChange("firstName", event.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label>{t("resource.common.fields.lastName")}</Label>
                      <Input
                        type="text"
                        value={formState.lastName}
                        onChange={(event) =>
                          handleInputChange("lastName", event.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label>{t("resource.common.fields.emailAddress")}</Label>
                      <Input
                        type="email"
                        value={formState.email}
                        onChange={(event) =>
                          handleInputChange("email", event.target.value)
                        }
                        error={emailInvalid}
                        hint={
                          emailInvalid
                            ? t(
                                "resource.forms.inputStates.hints.invalidEmail"
                              )
                            : undefined
                        }
                      />
                    </div>

                    <div>
                      <Label>{t("resource.common.fields.phone")}</Label>
                      <Input
                        type="tel"
                        value={formState.phone}
                        onChange={handlePhoneChange}
                      />
                    </div>

                    <div>
                      <Label>{t("resource.profile.labels.birthDate")}</Label>
                      <Input
                        type="text"
                        value={formState.birthDate}
                        placeholder={preferredDateFormat}
                        onChange={handleBirthDateChange}
                        error={birthDateInvalid}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                    {t("resource.profile.sections.preferences")}
                  </h5>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div>
                      <Label>{t("resource.profile.labels.theme")}</Label>
                      <Select
                        key={`theme-${selectKey}`}
                        options={themeOptions}
                        defaultValue={formState.theme}
                        onChange={(value) =>
                          handleInputChange("theme", value)
                        }
                      />
                    </div>

                    <div>
                      <Label>{t("resource.profile.labels.language")}</Label>
                      <Select
                        key={`language-${selectKey}`}
                        options={languageOptions}
                        defaultValue={formState.language}
                        onChange={(value) =>
                          handleInputChange("language", value)
                        }
                      />
                    </div>

                    <div>
                      <Label>{t("resource.profile.labels.dateFormat")}</Label>
                      <Select
                        key={`dateFormat-${selectKey}`}
                        options={dateFormatOptions}
                        defaultValue={formState.dateFormat}
                        onChange={(value) =>
                          handleInputChange("dateFormat", value)
                        }
                      />
                    </div>

                    <div>
                      <Label>{t("resource.profile.labels.currency")}</Label>
                      <Select
                        key={`currency-${selectKey}`}
                        options={currencyOptions}
                        defaultValue={formState.currency}
                        onChange={(value) =>
                          handleInputChange("currency", value)
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>{t("resource.profile.labels.hideValues")}</Label>
                      <Switch
                        label={
                          formState.hideValues
                            ? t("resource.common.status.active")
                            : t("resource.common.status.inactive")
                        }
                        defaultChecked={formState.hideValues}
                        onChange={(checked) =>
                          setFormState((prev) => ({
                            ...prev,
                            hideValues: checked,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {formError && (
              <p className="px-2 text-xs text-error-500">{formError}</p>
            )}

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                {t("resource.common.actions.cancel")}
              </Button>
              <Button size="sm" onClick={handleProfileSave}>
                {updateUserMutation.isPending
                  ? t("resource.common.actions.saving")
                  : t("resource.common.actions.saveChanges")}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}




