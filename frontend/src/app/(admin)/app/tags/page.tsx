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
import { useAuth } from "@/context/AuthContext";
import { useCreateTag, useDeleteTag, useTagsByUser, useUpdateTag } from "@/api/tags.hooks";
import { getApiErrorMessage } from "@/api/errorHandling";

export default function TagsPage() {
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
      setFormError("Missing user session.");
      return;
    }

    if (!name.trim()) {
      setFormError("Name is required.");
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
      setFormError(getApiErrorMessage(error));
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
      setEditError("Tag not selected.");
      return;
    }

    if (!editName.trim()) {
      setEditError("Name is required.");
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
      setEditError(getApiErrorMessage(error));
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this tag?");
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
          Tags
        </h2>
      </div>

      <ComponentCard title="Create Tag" desc="Label your transactions">
        <form onSubmit={handleCreate}>
          <div key={formKey} className="grid gap-5 md:grid-cols-2">
            {formError && (
              <div className="md:col-span-2">
                <Alert
                  variant="error"
                  title="Tag not created"
                  message={formError}
                />
              </div>
            )}
            <div>
              <Label>
                Name <span className="text-error-500">*</span>
              </Label>
              <Input
                placeholder="Tag name"
                name="name"
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="flex items-center justify-between md:col-span-2">
              <Checkbox checked={active} onChange={setActive} label="Active" />
              <Button
                className="min-w-[140px]"
                size="sm"
                disabled={createTagMutation.isPending}
              >
                {createTagMutation.isPending ? "Saving..." : "Create Tag"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>

      <ComponentCard title="Tags List" desc="Manage tags">
        {tagsQuery.isError && (
          <Alert
            variant="error"
            title="Tags unavailable"
            message={getApiErrorMessage(tagsQuery.error)}
          />
        )}
        {deleteTagMutation.isError && (
          <Alert
            variant="error"
            title="Delete failed"
            message={getApiErrorMessage(deleteTagMutation.error)}
          />
        )}
        {!tagsQuery.isError && tagsQuery.isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading tags...
          </p>
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
                      Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {tags.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        No tags available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    tags.map((tag) => (
                      <TableRow key={tag.id}>
                        <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                          {tag.name || "Unnamed"}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {tag.active ? "Active" : "Inactive"}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(tag)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={deleteTagMutation.isPending}
                              onClick={() => handleDelete(tag.id)}
                            >
                              Delete
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
            Edit Tag
          </h3>
          <form onSubmit={handleEdit} className="mt-5 space-y-5">
            <div key={editKey} className="space-y-5">
              {editError && (
                <Alert
                  variant="error"
                  title="Update failed"
                  message={editError}
                />
              )}
              <div>
                <Label>
                  Name <span className="text-error-500">*</span>
                </Label>
                <Input
                  placeholder="Tag name"
                  name="edit-name"
                  defaultValue={editName}
                  onChange={(event) => setEditName(event.target.value)}
                />
              </div>
              <Checkbox
                checked={editActive}
                onChange={setEditActive}
                label="Active"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button size="sm" disabled={updateTagMutation.isPending}>
                {updateTagMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
