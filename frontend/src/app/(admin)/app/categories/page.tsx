"use client";

import React, { useMemo, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Checkbox from "@/components/form/input/Checkbox";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/features/auth/context";
import {
  useCategoriesByUser,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/features/categories/hooks";
import type { CategoryColor, CategoryType } from "@/shared/types/domain";
import { getApiErrorMessage } from "@/shared/lib/api/errors";
import { isBlank } from "@/shared/lib/validation";
import { EmptyState, ErrorState, LoadingState } from "@/shared/ui/states";
import { useTranslation } from "react-i18next";

export default function CategoriesPage() {
  const { t } = useTranslation(["resource-categories", "resource-common"]);
  const { userId } = useAuth();
  const categoriesQuery = useCategoriesByUser(userId);
  const createCategoryMutation = useCreateCategory(userId);
  const updateCategoryMutation = useUpdateCategory(userId);
  const deleteCategoryMutation = useDeleteCategory(userId);

  const [formKey, setFormKey] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [categoryType, setCategoryType] = useState<CategoryType>("expense");
  const [color, setColor] = useState<CategoryColor>("purple");
  const [active, setActive] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editKey, setEditKey] = useState(0);
  const [editError, setEditError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<CategoryType>("expense");
  const [editColor, setEditColor] = useState<CategoryColor>("purple");
  const [editActive, setEditActive] = useState(true);

  const typeOptions = useMemo(
    () => [
      { value: "income", label: t("resource.categories.types.income") },
      { value: "expense", label: t("resource.categories.types.expense") },
    ],
    [t]
  );
  const colorOptions = useMemo(
    () => [
      { value: "purple", label: t("resource.categories.colors.purple") },
      { value: "red", label: t("resource.categories.colors.red") },
      { value: "blue", label: t("resource.categories.colors.blue") },
      { value: "green", label: t("resource.categories.colors.green") },
      { value: "yellow", label: t("resource.categories.colors.yellow") },
      { value: "orange", label: t("resource.categories.colors.orange") },
      { value: "pink", label: t("resource.categories.colors.pink") },
      { value: "gray", label: t("resource.categories.colors.gray") },
      { value: "cyan", label: t("resource.categories.colors.cyan") },
      { value: "indigo", label: t("resource.categories.colors.indigo") },
    ],
    [t]
  );
  const typeLabels = useMemo(
    () => new Map(typeOptions.map((option) => [option.value, option.label])),
    [typeOptions]
  );
  const colorLabels = useMemo(
    () => new Map(colorOptions.map((option) => [option.value, option.label])),
    [colorOptions]
  );

  const categories = useMemo(
    () => categoriesQuery.data?.data ?? [],
    [categoriesQuery.data]
  );

  const resetForm = () => {
    setName("");
    setCategoryType("expense");
    setColor("purple");
    setActive(true);
    setFormKey((prev) => prev + 1);
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!userId) {
      setFormError(t("resource.common.errors.missingSession"));
      return;
    }

    if (isBlank(name)) {
      setFormError(t("resource.categories.errors.nameRequired"));
      return;
    }

    try {
      await createCategoryMutation.mutateAsync({
        name: name.trim(),
        type: categoryType,
        color,
        user_id: userId,
        active,
      });
      resetForm();
    } catch (error) {
      setFormError(getApiErrorMessage(error, t("resource.common.errors.generic")));
    }
  };

  const openEditModal = (category: (typeof categories)[number]) => {
    setEditId(category.id);
    setEditName(category.name || "");
    setEditType(category.type);
    setEditColor(category.color);
    setEditActive(category.active);
    setEditError(null);
    setEditKey((prev) => prev + 1);
    setIsEditOpen(true);
  };

  const handleEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEditError(null);

    if (!editId) {
      setEditError(t("resource.categories.errors.notSelected"));
      return;
    }

    if (isBlank(editName)) {
      setEditError(t("resource.categories.errors.nameRequired"));
      return;
    }

    try {
      await updateCategoryMutation.mutateAsync({
        id: editId,
        payload: {
          name: editName.trim(),
          type: editType,
          color: editColor,
          active: editActive,
        },
      });
      setIsEditOpen(false);
    } catch (error) {
      setEditError(getApiErrorMessage(error, t("resource.common.errors.generic")));
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      t("resource.categories.confirmDelete")
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteCategoryMutation.mutateAsync(id);
    } catch {
      // Error handled by mutation state.
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {t("resource.categories.title")}
        </h2>
      </div>

      <ComponentCard
        title={t("resource.categories.create.title")}
        desc={t("resource.categories.create.desc")}
      >
        <form onSubmit={handleCreate}>
          <div key={formKey} className="grid gap-5 md:grid-cols-2">
            {formError && (
              <div className="md:col-span-2">
                <Alert
                  variant="error"
                  title={t("resource.categories.create.errors.notCreated")}
                  message={formError}
                />
              </div>
            )}
            <div>
              <Label>
                {t("resource.common.fields.name")}{" "}
                <span className="text-error-500">*</span>
              </Label>
              <Input
                placeholder={t("resource.categories.placeholders.name")}
                name="name"
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div>
              <Label>
                {t("resource.common.fields.type")}{" "}
                <span className="text-error-500">*</span>
              </Label>
              <Select
                key={`create-type-${formKey}`}
                options={typeOptions}
                defaultValue={categoryType}
                onChange={(value) => setCategoryType(value as CategoryType)}
              />
            </div>
            <div>
              <Label>{t("resource.categories.fields.color")}</Label>
              <Select
                key={`create-color-${formKey}`}
                options={colorOptions}
                defaultValue={color}
                onChange={(value) => setColor(value as CategoryColor)}
              />
            </div>
            <div className="flex items-center justify-between md:col-span-2">
              <Checkbox
                checked={active}
                onChange={setActive}
                label={t("resource.common.status.active")}
              />
              <Button
                className="min-w-[140px]"
                size="sm"
                disabled={createCategoryMutation.isPending}
              >
                {createCategoryMutation.isPending
                  ? t("resource.common.actions.saving")
                  : t("resource.categories.create.actions.submit")}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>

      <ComponentCard
        title={t("resource.categories.list.title")}
        desc={t("resource.categories.list.desc")}
      >
        {categoriesQuery.isError && (
          <ErrorState
            title={t("resource.categories.list.unavailable")}
            message={getApiErrorMessage(
              categoriesQuery.error,
              t("resource.common.errors.generic")
            )}
          />
        )}
        {deleteCategoryMutation.isError && (
          <ErrorState
            title={t("resource.common.errors.deleteFailed")}
            message={getApiErrorMessage(
              deleteCategoryMutation.error,
              t("resource.common.errors.generic")
            )}
          />
        )}
        {!categoriesQuery.isError && categoriesQuery.isLoading && (
          <LoadingState message={t("resource.categories.list.loading")} />
        )}
        {!categoriesQuery.isError && !categoriesQuery.isLoading && (
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      {t("resource.common.fields.name")}
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      {t("resource.common.fields.type")}
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      {t("resource.categories.fields.color")}
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      {t("resource.common.fields.status")}
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      {t("resource.common.fields.actions")}
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <EmptyState message={t("resource.categories.list.empty")} />
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                          {category.name || t("resource.categories.list.unnamed")}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {typeLabels.get(category.type) ?? category.type}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {colorLabels.get(category.color) ?? category.color}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {category.active
                            ? t("resource.common.status.active")
                            : t("resource.common.status.inactive")}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(category)}
                            >
                              {t("resource.common.actions.edit")}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={deleteCategoryMutation.isPending}
                              onClick={() => handleDelete(category.id)}
                            >
                              {t("resource.common.actions.delete")}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </ComponentCard>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("resource.categories.edit.title")}
          </h3>
          <form onSubmit={handleEdit} className="mt-5 space-y-5">
            <div key={editKey} className="space-y-5">
              {editError && (
                <Alert
                  variant="error"
                  title={t("resource.common.errors.updateFailed")}
                  message={editError}
                />
              )}
              <div>
                <Label>
                  {t("resource.common.fields.name")}{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <Input
                  placeholder={t("resource.categories.placeholders.name")}
                  name="edit-name"
                  defaultValue={editName}
                  onChange={(event) => setEditName(event.target.value)}
                />
              </div>
              <div>
                <Label>
                  {t("resource.common.fields.type")}{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <Select
                  key={`edit-type-${editKey}`}
                  options={typeOptions}
                  defaultValue={editType}
                  onChange={(value) => setEditType(value as CategoryType)}
                />
              </div>
              <div>
                <Label>{t("resource.categories.fields.color")}</Label>
                <Select
                  key={`edit-color-${editKey}`}
                  options={colorOptions}
                  defaultValue={editColor}
                  onChange={(value) => setEditColor(value as CategoryColor)}
                />
              </div>
              <Checkbox
                checked={editActive}
                onChange={setEditActive}
                label={t("resource.common.status.active")}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(false)}
              >
                {t("resource.common.actions.cancel")}
              </Button>
              <Button
                size="sm"
                disabled={updateCategoryMutation.isPending}
              >
                {updateCategoryMutation.isPending
                  ? t("resource.common.actions.saving")
                  : t("resource.common.actions.saveChanges")}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}


