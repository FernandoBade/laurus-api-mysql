"use client";

import React, { useMemo, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
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
  useCreateTag,
  useDeleteTag,
  useTagsByUser,
  useUpdateTag,
} from "@/features/tags/hooks";
import { getApiErrorMessage } from "@/shared/lib/api/errors";
import { isBlank } from "@/shared/lib/validation";
import { EmptyState, ErrorState, LoadingState } from "@/shared/ui/states";
import { useTranslation } from "react-i18next";

export default function TagsPage() {
  const { t } = useTranslation(["resource-tags", "resource-common"]);
  const { userId } = useAuth();
  const tagsQuery = useTagsByUser(userId);
  const createTagMutation = useCreateTag(userId);
  const updateTagMutation = useUpdateTag(userId);
  const deleteTagMutation = useDeleteTag(userId);

  const [formKey, setFormKey] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editKey, setEditKey] = useState(0);
  const [editError, setEditError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editActive, setEditActive] = useState(true);

  const tags = useMemo(() => tagsQuery.data?.data ?? [], [tagsQuery.data]);

  const resetForm = () => {
    setName("");
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
      setFormError(t("resource.tags.errors.nameRequired"));
      return;
    }

    try {
      await createTagMutation.mutateAsync({
        name: name.trim(),
        user_id: userId,
        active,
      });
      resetForm();
    } catch (error) {
      setFormError(getApiErrorMessage(error, t("resource.common.errors.generic")));
    }
  };

  const openEditModal = (tag: (typeof tags)[number]) => {
    setEditId(tag.id);
    setEditName(tag.name || "");
    setEditActive(tag.active);
    setEditError(null);
    setEditKey((prev) => prev + 1);
    setIsEditOpen(true);
  };

  const handleEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEditError(null);

    if (!editId) {
      setEditError(t("resource.tags.errors.notSelected"));
      return;
    }

    if (isBlank(editName)) {
      setEditError(t("resource.tags.errors.nameRequired"));
      return;
    }

    try {
      await updateTagMutation.mutateAsync({
        id: editId,
        payload: {
          name: editName.trim(),
          active: editActive,
        },
      });
      setIsEditOpen(false);
    } catch (error) {
      setEditError(getApiErrorMessage(error, t("resource.common.errors.generic")));
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(t("resource.tags.confirmDelete"));
    if (!confirmed) {
      return;
    }

    try {
      await deleteTagMutation.mutateAsync(id);
    } catch {
      // Error handled in mutation state.
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {t("resource.tags.title")}
        </h2>
      </div>

      <ComponentCard
        title={t("resource.tags.create.title")}
        desc={t("resource.tags.create.desc")}
      >
        <form onSubmit={handleCreate}>
          <div key={formKey} className="grid gap-5 md:grid-cols-2">
            {formError && (
              <div className="md:col-span-2">
                <Alert
                  variant="error"
                  title={t("resource.tags.create.errors.notCreated")}
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
                placeholder={t("resource.tags.placeholders.name")}
                name="name"
                onChange={(event) => setName(event.target.value)}
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
                disabled={createTagMutation.isPending}
              >
                {createTagMutation.isPending
                  ? t("resource.common.actions.saving")
                  : t("resource.tags.create.actions.submit")}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>

      <ComponentCard
        title={t("resource.tags.list.title")}
        desc={t("resource.tags.list.desc")}
      >
        {tagsQuery.isError && (
          <ErrorState
            title={t("resource.tags.list.unavailable")}
            message={getApiErrorMessage(
              tagsQuery.error,
              t("resource.common.errors.generic")
            )}
          />
        )}
        {deleteTagMutation.isError && (
          <ErrorState
            title={t("resource.common.errors.deleteFailed")}
            message={getApiErrorMessage(
              deleteTagMutation.error,
              t("resource.common.errors.generic")
            )}
          />
        )}
        {!tagsQuery.isError && tagsQuery.isLoading && (
          <LoadingState message={t("resource.tags.list.loading")} />
        )}
        {!tagsQuery.isError && !tagsQuery.isLoading && (
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
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
                  {tags.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <EmptyState message={t("resource.tags.list.empty")} />
                      </TableCell>
                    </TableRow>
                  ) : (
                    tags.map((tag) => (
                      <TableRow key={tag.id}>
                        <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                          {tag.name || t("resource.tags.list.unnamed")}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {tag.active
                            ? t("resource.common.status.active")
                            : t("resource.common.status.inactive")}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(tag)}
                            >
                              {t("resource.common.actions.edit")}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={deleteTagMutation.isPending}
                              onClick={() => handleDelete(tag.id)}
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
            {t("resource.tags.edit.title")}
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
                  placeholder={t("resource.tags.placeholders.name")}
                  name="edit-name"
                  defaultValue={editName}
                  onChange={(event) => setEditName(event.target.value)}
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
              <Button size="sm" disabled={updateTagMutation.isPending}>
                {updateTagMutation.isPending
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


