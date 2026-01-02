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
import { useAuth } from "@/context/AuthContext";
import {
  useCategoriesByUser,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/api/categories.hooks";
import type { CategoryColor, CategoryType } from "@/api/shared.types";
import { getApiErrorMessage } from "@/api/errorHandling";

const typeOptions = [
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
];

const colorOptions = [
  { value: "purple", label: "Purple" },
  { value: "red", label: "Red" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "yellow", label: "Yellow" },
  { value: "orange", label: "Orange" },
  { value: "pink", label: "Pink" },
  { value: "gray", label: "Gray" },
  { value: "cyan", label: "Cyan" },
  { value: "indigo", label: "Indigo" },
];

export default function CategoriesPage() {
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
      setFormError("Missing user session.");
      return;
    }

    if (!name.trim()) {
      setFormError("Name is required.");
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
      setFormError(getApiErrorMessage(error));
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
      setEditError("Category not selected.");
      return;
    }

    if (!editName.trim()) {
      setEditError("Name is required.");
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
      setEditError(getApiErrorMessage(error));
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
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
          Categories
        </h2>
      </div>

      <ComponentCard title="Create Category" desc="Organize your transactions">
        <form onSubmit={handleCreate}>
          <div key={formKey} className="grid gap-5 md:grid-cols-2">
            {formError && (
              <div className="md:col-span-2">
                <Alert
                  variant="error"
                  title="Category not created"
                  message={formError}
                />
              </div>
            )}
            <div>
              <Label>
                Name <span className="text-error-500">*</span>
              </Label>
              <Input
                placeholder="Category name"
                name="name"
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div>
              <Label>
                Type <span className="text-error-500">*</span>
              </Label>
              <Select
                key={`create-type-${formKey}`}
                options={typeOptions}
                defaultValue={categoryType}
                onChange={(value) => setCategoryType(value as CategoryType)}
              />
            </div>
            <div>
              <Label>Color</Label>
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
                label="Active"
              />
              <Button
                className="min-w-[140px]"
                size="sm"
                disabled={createCategoryMutation.isPending}
              >
                {createCategoryMutation.isPending ? "Saving..." : "Create Category"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>

      <ComponentCard title="Categories List" desc="Manage categories">
        {categoriesQuery.isError && (
          <Alert
            variant="error"
            title="Categories unavailable"
            message={getApiErrorMessage(categoriesQuery.error)}
          />
        )}
        {deleteCategoryMutation.isError && (
          <Alert
            variant="error"
            title="Delete failed"
            message={getApiErrorMessage(deleteCategoryMutation.error)}
          />
        )}
        {!categoriesQuery.isError && categoriesQuery.isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading categories...
          </p>
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
                      Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Type
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Color
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
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        No categories available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                          {category.name || "Unnamed"}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {category.type}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {category.color}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {category.active ? "Active" : "Inactive"}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(category)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={deleteCategoryMutation.isPending}
                              onClick={() => handleDelete(category.id)}
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
            Edit Category
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
                  placeholder="Category name"
                  name="edit-name"
                  defaultValue={editName}
                  onChange={(event) => setEditName(event.target.value)}
                />
              </div>
              <div>
                <Label>
                  Type <span className="text-error-500">*</span>
                </Label>
                <Select
                  key={`edit-type-${editKey}`}
                  options={typeOptions}
                  defaultValue={editType}
                  onChange={(value) => setEditType(value as CategoryType)}
                />
              </div>
              <div>
                <Label>Color</Label>
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
              <Button
                size="sm"
                disabled={updateCategoryMutation.isPending}
              >
                {updateCategoryMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
