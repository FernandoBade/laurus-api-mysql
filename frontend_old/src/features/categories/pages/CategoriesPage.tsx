"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import { Modal } from "@/components/ui/modal";
import Pagination from "@/components/tables/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ColorPicker from "@/components/form/ColorPicker";
import { useAuthSession } from "@/features/auth/context";
import {
  useCategoriesByUser,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/features/categories/hooks";
import type {
  Category,
  CategoryDeleteTarget as DeleteTarget,
  CategoryFormHandlers,
  CategoryFormState,
  CategoryGroup,
  CategoryModalProps,
  CategorySortDirection as SortDirection,
  CategorySortKey as SortKey,
} from "@/features/categories/types";
import {
  useCreateSubcategory,
  useDeleteSubcategory,
  useSubcategoriesByUser,
  useUpdateSubcategory,
} from "@/features/subcategories/hooks";
import type {
  Subcategory,
  SubcategoryFormHandlers,
  SubcategoryFormState,
  SubcategoryModalProps,
} from "@/features/subcategories/types";
import type { CategoryColor, CategoryType } from "@/shared/types/domain";
import { getApiErrorMessage } from "@/shared/lib/api/errors";
import { ErrorState } from "@/components/ui/states";
import { useTranslation } from "react-i18next";
import {
  Archive,
  ArrowCounterClockwise,
  CaretDown,
  CaretRight,
  CaretUp,
  CaretUpDown,
  CheckCircle,
  MagicWandIcon,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  TagChevronIcon,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react";


const normalizeSearchText = (value: string) => value.trim().toLowerCase();

const colorClassMap: Record<CategoryColor, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  yellow: "bg-yellow-500",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
  gray: "bg-gray-500",
  cyan: "bg-cyan-500",
  indigo: "bg-indigo-500",
};

const colorClassMapLight: Record<CategoryColor, string> = {
  red: "bg-red-400",
  blue: "bg-blue-400",
  green: "bg-green-400",
  purple: "bg-purple-400",
  yellow: "bg-yellow-400",
  orange: "bg-orange-400",
  pink: "bg-pink-400",
  gray: "bg-gray-400",
  cyan: "bg-cyan-400",
  indigo: "bg-indigo-400",
};

const CategoryModal = ({
  isOpen,
  title,
  description,
  submitLabel,
  isSubmitting,
  onClose,
  onSubmit,
  error,
  errorTitle,
  formKey,
  typeOptions,
  colorOptions,
  state,
  handlers,
  t,
}: CategoryModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} className="m-4 w-full max-w-[560px]">
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      <form onSubmit={onSubmit} className="space-y-5">
        {error && (
          <Alert variant="error" title={errorTitle} message={error} />
        )}
        <div key={formKey} className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>
              {t("resource.common.fields.name")}{" "}
              <span className="text-error-500">*</span>
            </Label>
            <Input
              placeholder={t("resource.categories.placeholders.name")}
              name="name"
              defaultValue={state.name}
              onChange={(event) => handlers.onNameChange(event.target.value)}
            />
          </div>
          <div>
            <Label>
              {t("resource.common.fields.type")}{" "}
              <span className="text-error-500">*</span>
            </Label>
            <Select
              key={`category-type-${formKey}`}
              options={typeOptions}
              defaultValue={state.type}
              onChange={(value) => handlers.onTypeChange(value as CategoryType)}
            />
          </div>
          <div className="md:col-span-2">
            <Label>{t("resource.categories.fields.color")}</Label>
            <ColorPicker
              value={state.color}
              options={colorOptions}
              onChange={handlers.onColorChange}
              ariaLabel={t("resource.categories.fields.color")}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            {t("resource.common.actions.cancel")}
          </Button>
          <Button size="sm" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t("resource.common.actions.saving")
              : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  </Modal>
);

const SubcategoryModal = ({
  isOpen,
  title,
  submitLabel,
  isSubmitting,
  onClose,
  onSubmit,
  error,
  errorTitle,
  formKey,
  categoryOptions,
  colorOptions,
  state,
  handlers,
  t,
}: SubcategoryModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} className="m-4 w-full max-w-[560px]">
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h3>
      </div>
      <form onSubmit={onSubmit} className="space-y-5">
        {error && (
          <Alert variant="error" title={errorTitle} message={error} />
        )}
        <div key={formKey} className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>
              {t("resource.common.fields.name")}{" "}
              <span className="text-error-500">*</span>
            </Label>
            <Input
              placeholder={t(
                "resource.categories.subcategories.placeholders.name"
              )}
              name="subcategory-name"
              defaultValue={state.name}
              onChange={(event) => handlers.onNameChange(event.target.value)}
            />
          </div>
          <div>
            <Label>
              {t("resource.common.fields.category")}{" "}
              <span className="text-error-500">*</span>
            </Label>
            <Select
              key={`subcategory-category-${formKey}`}
              options={categoryOptions}
              defaultValue={state.categoryId}
              placeholder={t(
                "resource.categories.subcategories.placeholders.category"
              )}
              onChange={handlers.onCategoryChange}
            />
          </div>
          <div>
            <Label>{t("resource.common.fields.type")}</Label>
            <Input
              value={state.typeLabel}
              readOnly
              className="bg-gray-50 dark:bg-gray-900/40"
            />
          </div>
          <div className="md:col-span-2">
            <Label>{t("resource.categories.fields.color")}</Label>
            <ColorPicker
              value={state.color}
              options={colorOptions}
              disabled
              ariaLabel={t("resource.categories.fields.color")}
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {t("resource.categories.subcategories.helpers.colorInherited")}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            {t("resource.common.actions.cancel")}
          </Button>
          <Button size="sm" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t("resource.common.actions.saving")
              : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  </Modal>
);

export default function CategoriesPage() {
  const { t, i18n } = useTranslation(["resource-categories", "resource-common"]);
  const { userId } = useAuthSession();
  const categoriesQuery = useCategoriesByUser(userId, { pageSize: 500 });
  const subcategoriesQuery = useSubcategoriesByUser(userId, { pageSize: 500 });
  const createCategoryMutation = useCreateCategory(userId);
  const updateCategoryMutation = useUpdateCategory(userId);
  const deleteCategoryMutation = useDeleteCategory(userId);
  const createSubcategoryMutation = useCreateSubcategory(userId);
  const updateSubcategoryMutation = useUpdateSubcategory(userId);
  const deleteSubcategoryMutation = useDeleteSubcategory(userId);

  const [formKey, setFormKey] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [categoryType, setCategoryType] = useState<CategoryType>("expense");
  const [color, setColor] = useState<CategoryColor>("purple");
  const [active, setActive] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editKey, setEditKey] = useState(0);
  const [editError, setEditError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<CategoryType>("expense");
  const [editColor, setEditColor] = useState<CategoryColor>("purple");
  const [editActive, setEditActive] = useState(true);

  const [subcategoryFormKey, setSubcategoryFormKey] = useState(0);
  const [subcategoryError, setSubcategoryError] = useState<string | null>(null);
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryCategoryId, setSubcategoryCategoryId] = useState("");
  const [subcategoryActive, setSubcategoryActive] = useState(true);
  const [isSubcategoryCreateOpen, setIsSubcategoryCreateOpen] = useState(false);

  const [editSubcategoryKey, setEditSubcategoryKey] = useState(0);
  const [editSubcategoryError, setEditSubcategoryError] = useState<string | null>(
    null
  );
  const [editSubcategoryId, setEditSubcategoryId] = useState<number | null>(null);
  const [editSubcategoryName, setEditSubcategoryName] = useState("");
  const [editSubcategoryCategoryId, setEditSubcategoryCategoryId] = useState("");
  const [editSubcategoryActive, setEditSubcategoryActive] = useState(true);
  const [isSubcategoryEditOpen, setIsSubcategoryEditOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [showArchived, setShowArchived] = useState(false);
  const [collapsedCategoryIds, setCollapsedCategoryIds] = useState<Set<number>>(
    new Set()
  );

  const locale = i18n.language || "en-US";

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
  const pageSizeOptions = useMemo(
    () =>
      [10, 25, 50, 100].map((size) => ({
        value: String(size),
        label: String(size),
      })),
    []
  );

  const categories = useMemo(
    () => categoriesQuery.data?.data ?? [],
    [categoriesQuery.data]
  );
  const subcategories = useMemo(
    () => subcategoriesQuery.data?.data ?? [],
    [subcategoriesQuery.data]
  );
  const filteredCategories = useMemo(
    () => (showArchived ? categories : categories.filter((item) => item.active)),
    [categories, showArchived]
  );
  const filteredSubcategories = useMemo(
    () =>
      showArchived
        ? subcategories
        : subcategories.filter((item) => item.active),
    [showArchived, subcategories]
  );
  const categoryById = useMemo(
    () => new Map(filteredCategories.map((category) => [category.id, category])),
    [filteredCategories]
  );
  const subcategoriesByCategory = useMemo(() => {
    const map = new Map<number, Subcategory[]>();
    filteredSubcategories.forEach((subcategory) => {
      const list = map.get(subcategory.categoryId);
      if (list) {
        list.push(subcategory);
      } else {
        map.set(subcategory.categoryId, [subcategory]);
      }
    });
    return map;
  }, [filteredSubcategories]);
  const normalizedSearch = useMemo(
    () => normalizeSearchText(searchQuery),
    [searchQuery]
  );
  const areAllCollapsed = useMemo(
    () =>
      filteredCategories.length > 0 &&
      filteredCategories.every((category) => collapsedCategoryIds.has(category.id)),
    [collapsedCategoryIds, filteredCategories]
  );

  const resolveCategoryLabel = useCallback(
    (category: Category) =>
      category.name || t("resource.categories.list.unnamed"),
    [t]
  );
  const resolveCategoryTypeLabel = useCallback(
    (category: Category) => typeLabels.get(category.type) ?? category.type,
    [typeLabels]
  );
  const sortedCategories = useMemo(() => {
    const items = [...filteredCategories];
    const direction = sortDirection === "asc" ? 1 : -1;
    items.sort((first, second) => {
      let result = 0;
      if (sortKey === "type") {
        const firstLabel = resolveCategoryTypeLabel(first);
        const secondLabel = resolveCategoryTypeLabel(second);
        result = firstLabel.localeCompare(secondLabel, locale, {
          sensitivity: "base",
        });
      } else {
        const firstLabel = resolveCategoryLabel(first);
        const secondLabel = resolveCategoryLabel(second);
        result = firstLabel.localeCompare(secondLabel, locale, {
          sensitivity: "base",
        });
      }
      if (result === 0) {
        result = first.id - second.id;
      }
      return result * direction;
    });
    return items;
  }, [
    filteredCategories,
    locale,
    sortDirection,
    sortKey,
    resolveCategoryLabel,
    resolveCategoryTypeLabel,
  ]);

  const sortSubcategories = useCallback(
    (items: Subcategory[]) =>
      [...items].sort((first, second) => {
        const firstLabel =
          first.name || t("resource.categories.subcategories.list.unnamed");
        const secondLabel =
          second.name || t("resource.categories.subcategories.list.unnamed");
        const result = firstLabel.localeCompare(secondLabel, locale, {
          sensitivity: "base",
        });
        return result === 0 ? first.id - second.id : result;
      }),
    [locale, t]
  );

  const groupedCategories = useMemo(() => {
    if (!normalizedSearch) {
      return sortedCategories.map((category) => ({
        category,
        subcategories: sortSubcategories(
          subcategoriesByCategory.get(category.id) ?? []
        ),
      }));
    }
    const matches: CategoryGroup[] = [];
    sortedCategories.forEach((category) => {
      const nameMatch = (category.name || "")
        .toLowerCase()
        .includes(normalizedSearch);
      const categorySubcategories = sortSubcategories(
        subcategoriesByCategory.get(category.id) ?? []
      );
      const matchedSubcategories = categorySubcategories.filter((subcategory) =>
        (subcategory.name || "").toLowerCase().includes(normalizedSearch)
      );
      if (nameMatch) {
        matches.push({
          category,
          subcategories: categorySubcategories,
        });
      } else if (matchedSubcategories.length > 0) {
        matches.push({
          category,
          subcategories: matchedSubcategories,
        });
      }
    });
    return matches;
  }, [normalizedSearch, sortSubcategories, sortedCategories, subcategoriesByCategory]);

  const totalResults = groupedCategories.length;
  const totalPages = Math.max(Math.ceil(totalResults / pageSize), 1);
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedCategories = useMemo(
    () =>
      groupedCategories.slice(
        (safeCurrentPage - 1) * pageSize,
        safeCurrentPage * pageSize
      ),
    [groupedCategories, pageSize, safeCurrentPage]
  );
  const tableRows = useMemo(
    () =>
      pagedCategories.flatMap((group) => {
        const isCollapsed = collapsedCategoryIds.has(group.category.id);
        if (isCollapsed) {
          return [{ type: "category" as const, category: group.category }];
        }
        return [
          { type: "category" as const, category: group.category },
          ...group.subcategories.map((subcategory) => ({
            type: "subcategory" as const,
            category: group.category,
            subcategory,
          })),
        ];
      }),
    [collapsedCategoryIds, pagedCategories]
  );
  const categoryOptions = useMemo(
    () =>
      sortedCategories.map((category) => ({
        value: String(category.id),
        label:
          category.name ||
          t("resource.categories.fallbacks.categoryWithId", {
            id: category.id,
          }),
      })),
    [sortedCategories, t]
  );

  const isLoading = categoriesQuery.isLoading || subcategoriesQuery.isLoading;
  const hasQueryError = categoriesQuery.isError || subcategoriesQuery.isError;

  const resetCategoryForm = () => {
    setName("");
    setCategoryType("expense");
    setColor("purple");
    setActive(true);
    setFormKey((prev) => prev + 1);
  };

  const resetSubcategoryForm = (categoryId = "") => {
    setSubcategoryName("");
    setSubcategoryCategoryId(categoryId);
    setSubcategoryActive(true);
    setSubcategoryFormKey((prev) => prev + 1);
  };

  const openCreateModal = () => {
    resetCategoryForm();
    setFormError(null);
    setIsSuccessOpen(false);
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
  };

  const closeSuccessModal = () => {
    setIsSuccessOpen(false);
  };

  const openEditModal = (category: Category) => {
    setEditId(category.id);
    setEditName(category.name || "");
    setEditType(category.type);
    setEditColor(category.color);
    setEditActive(category.active);
    setEditError(null);
    setEditKey((prev) => prev + 1);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
  };

  const openCreateSubcategoryModal = (categoryId?: number) => {
    resetSubcategoryForm(categoryId ? String(categoryId) : "");
    setSubcategoryError(null);
    setIsSubcategoryCreateOpen(true);
  };

  const closeCreateSubcategoryModal = () => {
    setIsSubcategoryCreateOpen(false);
  };

  const openEditSubcategoryModal = (subcategory: Subcategory) => {
    setEditSubcategoryId(subcategory.id);
    setEditSubcategoryName(subcategory.name || "");
    setEditSubcategoryCategoryId(String(subcategory.categoryId));
    setEditSubcategoryActive(subcategory.active);
    setEditSubcategoryError(null);
    setEditSubcategoryKey((prev) => prev + 1);
    setIsSubcategoryEditOpen(true);
  };

  const closeEditSubcategoryModal = () => {
    setIsSubcategoryEditOpen(false);
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!userId) {
      setFormError(t("resource.common.errors.missingSession"));
      return;
    }

    if (!name.trim()) {
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
      setIsCreateOpen(false);
      setIsSuccessOpen(true);
      resetCategoryForm();
    } catch (error) {
      setFormError(getApiErrorMessage(error, t("resource.common.errors.generic")));
    }
  };

  const handleEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEditError(null);

    if (!editId) {
      setEditError(t("resource.categories.errors.notSelected"));
      return;
    }

    if (!editName.trim()) {
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

  const handleCreateSubcategory = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setSubcategoryError(null);

    if (!subcategoryName.trim()) {
      setSubcategoryError(
        t("resource.categories.subcategories.errors.nameRequired")
      );
      return;
    }

    if (!subcategoryCategoryId) {
      setSubcategoryError(
        t("resource.categories.subcategories.errors.categoryRequired")
      );
      return;
    }

    try {
      await createSubcategoryMutation.mutateAsync({
        name: subcategoryName.trim(),
        category_id: Number(subcategoryCategoryId),
        active: subcategoryActive,
      });
      setIsSubcategoryCreateOpen(false);
      resetSubcategoryForm();
    } catch (error) {
      setSubcategoryError(getApiErrorMessage(error, t("resource.common.errors.generic")));
    }
  };

  const handleEditSubcategory = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setEditSubcategoryError(null);

    if (!editSubcategoryId) {
      setEditSubcategoryError(
        t("resource.categories.subcategories.errors.notSelected")
      );
      return;
    }

    if (!editSubcategoryName.trim()) {
      setEditSubcategoryError(
        t("resource.categories.subcategories.errors.nameRequired")
      );
      return;
    }

    if (!editSubcategoryCategoryId) {
      setEditSubcategoryError(
        t("resource.categories.subcategories.errors.categoryRequired")
      );
      return;
    }

    try {
      await updateSubcategoryMutation.mutateAsync({
        id: editSubcategoryId,
        payload: {
          name: editSubcategoryName.trim(),
          category_id: Number(editSubcategoryCategoryId),
          active: editSubcategoryActive,
        },
      });
      setIsSubcategoryEditOpen(false);
    } catch (error) {
      setEditSubcategoryError(getApiErrorMessage(error, t("resource.common.errors.generic")));
    }
  };

  const handleToggleCategoryActive = async (category: Category) => {
    try {
      await updateCategoryMutation.mutateAsync({
        id: category.id,
        payload: {
          active: !category.active,
        },
      });
    } catch {
      // Error handled by mutation state.
    }
  };

  const handleToggleSubcategoryActive = async (subcategory: Subcategory) => {
    try {
      await updateSubcategoryMutation.mutateAsync({
        id: subcategory.id,
        payload: {
          active: !subcategory.active,
        },
      });
    } catch {
      // Error handled by mutation state.
    }
  };

  const openDeleteModal = (target: DeleteTarget) => {
    setDeleteTarget(target);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      if (deleteTarget.type === "category") {
        await deleteCategoryMutation.mutateAsync(deleteTarget.id);
      } else {
        await deleteSubcategoryMutation.mutateAsync(deleteTarget.id);
      }
      setDeleteTarget(null);
    } catch {
      // Error handled by mutation state.
    }
  };

  const handlePageSizeChange = (value: string) => {
    const nextSize = Number(value);
    if (!Number.isNaN(nextSize)) {
      setPageSize(nextSize);
      setCurrentPage(1);
    }
  };

  const renderCreateActions = (className = "") => (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <Button
        size="sm"
        variant="primary"
        type="button"
        className="text-theme-sm"
        startIcon={<Plus size={16} />}
        onClick={openCreateModal}
      >
        {t("resource.categories.actions.addCategory")}
      </Button>
    </div>
  );

  const isSearchActive = Boolean(normalizedSearch);
  const emptyTitle = isSearchActive
    ? t("resource.categories.list.emptySearch")
    : t("resource.categories.list.empty");
  const emptyMessage = isSearchActive
    ? t("resource.categories.list.emptySearchHelper")
    : t("resource.categories.list.emptyHelper");
  const toggleAllLabel = areAllCollapsed
    ? t("resource.categories.actions.expandAll")
    : t("resource.categories.actions.collapseAll");

  const deleteTitle =
    deleteTarget?.type === "subcategory"
      ? t("resource.categories.delete.subcategoryTitle")
      : t("resource.categories.delete.categoryTitle");
  const deleteSubtitle = t("resource.categories.delete.warningTitle");
  const deleteMessage = t("resource.categories.delete.warningMessage");

  const createCategoryState: CategoryFormState = {
    name,
    type: categoryType,
    color,
  };
  const createCategoryHandlers: CategoryFormHandlers = {
    onNameChange: setName,
    onTypeChange: setCategoryType,
    onColorChange: setColor,
  };
  const editCategoryState: CategoryFormState = {
    name: editName,
    type: editType,
    color: editColor,
  };
  const editCategoryHandlers: CategoryFormHandlers = {
    onNameChange: setEditName,
    onTypeChange: setEditType,
    onColorChange: setEditColor,
  };

  const selectedSubcategoryCategory = categoryById.get(
    Number(subcategoryCategoryId)
  );
  const selectedEditSubcategoryCategory = categoryById.get(
    Number(editSubcategoryCategoryId)
  );
  const subcategoryTypeLabel = selectedSubcategoryCategory
    ? typeLabels.get(selectedSubcategoryCategory.type) ??
      selectedSubcategoryCategory.type
    : t("resource.common.placeholders.emptyDash");
  const editSubcategoryTypeLabel = selectedEditSubcategoryCategory
    ? typeLabels.get(selectedEditSubcategoryCategory.type) ??
      selectedEditSubcategoryCategory.type
    : t("resource.common.placeholders.emptyDash");
  const subcategoryColor = selectedSubcategoryCategory?.color ?? "gray";
  const editSubcategoryColor = selectedEditSubcategoryCategory?.color ?? "gray";

  const createSubcategoryState: SubcategoryFormState = {
    name: subcategoryName,
    categoryId: subcategoryCategoryId,
    color: subcategoryColor,
    typeLabel: subcategoryTypeLabel,
  };
  const createSubcategoryHandlers: SubcategoryFormHandlers = {
    onNameChange: setSubcategoryName,
    onCategoryChange: setSubcategoryCategoryId,
  };
  const editSubcategoryState: SubcategoryFormState = {
    name: editSubcategoryName,
    categoryId: editSubcategoryCategoryId,
    color: editSubcategoryColor,
    typeLabel: editSubcategoryTypeLabel,
  };
  const editSubcategoryHandlers: SubcategoryFormHandlers = {
    onNameChange: setEditSubcategoryName,
    onCategoryChange: setEditSubcategoryCategoryId,
  };

  const toggleCategoryCollapse = (categoryId: number) => {
    setCollapsedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };
  const toggleAllCategories = () => {
    setCollapsedCategoryIds((prev) => {
      const next = new Set(prev);
      const allCollapsed =
        filteredCategories.length > 0 &&
        filteredCategories.every((category) => prev.has(category.id));
      filteredCategories.forEach((category) => {
        if (allCollapsed) {
          next.delete(category.id);
        } else {
          next.add(category.id);
        }
      });
      return next;
    });
  };

  const handleSortChange = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <CaretUpDown size={14} />;
    }
    return sortDirection === "asc" ? (
      <CaretUp size={14} />
    ) : (
      <CaretDown size={14} />
    );
  };

  const renderSortableHeader = (label: string, key: SortKey) => (
    <button
      type="button"
      onClick={() => handleSortChange(key)}
      className="inline-flex w-full items-center justify-between gap-1 text-left"
      aria-label={label}
      title={label}
    >
      <span>{label}</span>
      <span className="text-gray-400 dark:text-gray-500">
        {renderSortIcon(key)}
      </span>
    </button>
  );

  const tableHeader = (
    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
      <TableRow>
        <TableCell
          isHeader
          className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
        >
          {renderSortableHeader(t("resource.common.fields.name"), "name")}
        </TableCell>
        <TableCell
          isHeader
          className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
        >
          {renderSortableHeader(t("resource.common.fields.type"), "type")}
        </TableCell>
        <TableCell
          isHeader
          className="px-5 py-3 text-right text-theme-xs font-medium text-gray-500 dark:text-gray-400"
        >
          {t("resource.common.fields.actions")}
        </TableCell>
      </TableRow>
    </TableHeader>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {t("resource.categories.title")}
        </h2>
        {renderCreateActions()}
      </div>

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
        {subcategoriesQuery.isError && (
          <ErrorState
            title={t("resource.categories.subcategories.list.unavailable")}
            message={getApiErrorMessage(
              subcategoriesQuery.error,
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
        {deleteSubcategoryMutation.isError && (
          <ErrorState
            title={t("resource.common.errors.deleteFailed")}
            message={getApiErrorMessage(
              deleteSubcategoryMutation.error,
              t("resource.common.errors.generic")
            )}
          />
        )}
        {!hasQueryError && (
          <>
            <div className="mb-4 flex flex-wrap items-center align-middle gap-5">
              <div className="min-w-[200px]">
                <Label>{t("resource.categories.pagination.itemsPerPage")}</Label>
                <div className="relative">
                  <Select
                    key={`page-size-${pageSize}`}
                    options={pageSizeOptions}
                    defaultValue={String(pageSize)}
                    onChange={handlePageSizeChange}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <CaretDown size={16} />
                  </span>
                </div>
              </div>
              <div className="flex items-center align-middle mb-2.5">
                <Switch
                  label={t("resource.categories.filters.showArchived")}
                  defaultChecked={showArchived}
                  onChange={setShowArchived}
                />
              </div>

              <div className="w-full max-w-[420px] sm:ml-auto">
                <Label>{t("resource.categories.filters.search")}</Label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={t(
                      "resource.categories.filters.placeholders.search"
                    )}
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <MagnifyingGlass size={18} />
                  </span>
                </div>
              </div>
                      </div>

                                    <div className="flex items-center mb-0.5">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  disabled={filteredCategories.length === 0}
                  onClick={toggleAllCategories}
                >
                  <TagChevronIcon size={18}/>{}
                </Button>
              </div>
            {isLoading ? (
              <div className="overflow-x-auto">
                <div className="min-w-[760px]">
                  <Table>
                    {tableHeader}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <TableRow key={`skeleton-${index}`} className="animate-pulse">
                          <TableCell className="px-5 py-4">
                            <div className="h-3 w-28 rounded bg-gray-200 dark:bg-gray-800" />
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-800" />
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <div className="h-8 w-36 rounded bg-gray-200 dark:bg-gray-800" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : tableRows.length === 0 ? (
              <div className="space-y-4">
                <Alert variant="info" title={emptyTitle} message={emptyMessage} />
                {!isSearchActive && renderCreateActions()}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <div className="min-w-[760px]">
                    <Table>
                      {tableHeader}
                      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {tableRows.map((row) => {
                          if (row.type === "category") {
                            const categoryRow = row.category;
                            const nameLabel =
                              categoryRow.name ||
                              t("resource.categories.list.unnamed");
                            const isCollapsed = collapsedCategoryIds.has(
                              categoryRow.id
                            );
                            const toggleLabel = isCollapsed
                              ? t("resource.categories.actions.expand")
                              : t("resource.categories.actions.collapse");
                            const archiveLabel = categoryRow.active
                              ? t("resource.categories.actions.archive")
                              : t("resource.categories.actions.unarchive");
                            return (
                              <TableRow
                                key={`category-${categoryRow.id}`}
                                role="button"
                                tabIndex={0}
                                aria-expanded={!isCollapsed}
                                onClick={() =>
                                  toggleCategoryCollapse(categoryRow.id)
                                }
                                onKeyDown={(event) => {
                                  if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    toggleCategoryCollapse(categoryRow.id);
                                  }
                                }}
                                className={`cursor-pointer transition hover:bg-gray-50 dark:hover:bg-white/[0.03] bg-gray-50/60 dark:bg-white/[0.02] ${
                                  categoryRow.active ? "" : "opacity-60"
                                }`}
                              >
                                <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                                      aria-label={toggleLabel}
                                      title={toggleLabel}
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        toggleCategoryCollapse(categoryRow.id);
                                      }}
                                    >
                                      {isCollapsed ? (
                                        <CaretRight size={14} />
                                      ) : (
                                        <CaretDown size={14} />
                                      )}
                                    </button>
                                    <span
                                      className={`h-4 w-4 rounded-full ${
                                        colorClassMap[categoryRow.color]
                                      }`}
                                    />
                                    <span>{nameLabel}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                                  {typeLabels.get(categoryRow.type) ??
                                    categoryRow.type}
                                </TableCell>
                                <TableCell className="px-5 py-4 text-right">
                                  <div className="flex w-full items-center justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="primary"
                                      className="!h-9 !w-9 !px-0 !py-0"
                                      title={t(
                                        "resource.categories.actions.addSubcategory"
                                      )}
                                      ariaLabel={t(
                                        "resource.categories.actions.addSubcategory"
                                      )}
                                      disabled={
                                        !categoryRow.active ||
                                        createSubcategoryMutation.isPending
                                      }
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        openCreateSubcategoryModal(categoryRow.id);
                                      }}
                                    >
                                      <Plus size={16} />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="!h-9 !w-9 !px-0 !py-0"
                                      title={t("resource.common.actions.edit")}
                                      ariaLabel={t("resource.common.actions.edit")}
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        openEditModal(categoryRow);
                                      }}
                                    >
                                      <PencilSimple size={16} />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="!h-9 !w-9 !px-0 !py-0"
                                      title={archiveLabel}
                                      ariaLabel={archiveLabel}
                                      disabled={updateCategoryMutation.isPending}
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        handleToggleCategoryActive(categoryRow);
                                      }}
                                    >
                                      {categoryRow.active ? (
                                        <Archive size={16} />
                                      ) : (
                                        <ArrowCounterClockwise size={16} />
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="!h-9 !w-9 !px-0 !py-0"
                                      title={t("resource.common.actions.delete")}
                                      ariaLabel={t("resource.common.actions.delete")}
                                      disabled={deleteCategoryMutation.isPending}
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        openDeleteModal({
                                          type: "category",
                                          id: categoryRow.id,
                                        });
                                      }}
                                    >
                                      <Trash size={16} />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          }
                          const subcategoryRow = row.subcategory;
                          const subcategoryName =
                            subcategoryRow.name ||
                            t("resource.categories.subcategories.list.unnamed");
                          const parentColor =
                            categoryById.get(subcategoryRow.categoryId)?.color ??
                            "gray";
                          const archiveLabel = subcategoryRow.active
                            ? t("resource.categories.actions.archive")
                            : t("resource.categories.actions.unarchive");
                          return (
                            <TableRow
                              key={`subcategory-${subcategoryRow.id}`}
                              className={subcategoryRow.active ? "" : "opacity-60"}
                            >
                              <TableCell className="px-5 py-4">
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                  <span
                                    aria-hidden="true"
                                    className="h-7 w-7 flex-none"
                                  />
                                  <span
                                    className={`h-3 w-3 flex-none rounded-full ${
                                      colorClassMapLight[parentColor]
                                    }`}
                                  />
                                  <span className="pl-3">{subcategoryName}</span>
                                </div>
                              </TableCell>
                              <TableCell className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500">
                                {null}
                              </TableCell>
                              <TableCell className="px-5 py-4 text-right">
                                <div className="flex w-full items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="!h-9 !w-9 !px-0 !py-0"
                                    title={t("resource.common.actions.edit")}
                                    ariaLabel={t("resource.common.actions.edit")}
                                    onClick={() =>
                                      openEditSubcategoryModal(subcategoryRow)
                                    }
                                  >
                                    <PencilSimple size={16} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="!h-9 !w-9 !px-0 !py-0"
                                    title={archiveLabel}
                                    ariaLabel={archiveLabel}
                                    disabled={updateSubcategoryMutation.isPending}
                                    onClick={() =>
                                      handleToggleSubcategoryActive(subcategoryRow)
                                    }
                                  >
                                    {subcategoryRow.active ? (
                                      <Archive size={16} />
                                    ) : (
                                      <ArrowCounterClockwise size={16} />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="!h-9 !w-9 !px-0 !py-0"
                                    title={t("resource.common.actions.delete")}
                                    ariaLabel={t("resource.common.actions.delete")}
                                    disabled={deleteSubcategoryMutation.isPending}
                                    onClick={() =>
                                      openDeleteModal({
                                        type: "subcategory",
                                        id: subcategoryRow.id,
                                      })
                                    }
                                  >
                                    <Trash size={16} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    {t("resource.categories.list.totalResults", {
                      count: totalResults,
                    })}
                  </span>
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={safeCurrentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </div>
              </>
            )}
          </>
        )}
      </ComponentCard>

      <CategoryModal
        isOpen={isCreateOpen}
        title={t("resource.categories.create.title")}
        description={t("resource.categories.create.desc")}
        submitLabel={t("resource.categories.create.actions.submit")}
        isSubmitting={createCategoryMutation.isPending}
        onClose={closeCreateModal}
        onSubmit={handleCreate}
        error={formError}
        errorTitle={t("resource.categories.create.errors.notCreated")}
        formKey={formKey}
        typeOptions={typeOptions}
        colorOptions={colorOptions}
        state={createCategoryState}
        handlers={createCategoryHandlers}
        t={t}
      />

      <CategoryModal
        isOpen={isEditOpen}
        title={t("resource.categories.edit.title")}
        submitLabel={t("resource.common.actions.saveChanges")}
        isSubmitting={updateCategoryMutation.isPending}
        onClose={closeEditModal}
        onSubmit={handleEdit}
        error={editError}
        errorTitle={t("resource.common.errors.updateFailed")}
        formKey={editKey}
        typeOptions={typeOptions}
        colorOptions={colorOptions}
        state={editCategoryState}
        handlers={editCategoryHandlers}
        t={t}
      />

      <SubcategoryModal
        isOpen={isSubcategoryCreateOpen}
        title={t("resource.categories.subcategories.create.title")}
        submitLabel={t("resource.categories.subcategories.create.actions.submit")}
        isSubmitting={createSubcategoryMutation.isPending}
        onClose={closeCreateSubcategoryModal}
        onSubmit={handleCreateSubcategory}
        error={subcategoryError}
        errorTitle={t(
          "resource.categories.subcategories.create.errors.notCreated"
        )}
        formKey={subcategoryFormKey}
        categoryOptions={categoryOptions}
        colorOptions={colorOptions}
        state={createSubcategoryState}
        handlers={createSubcategoryHandlers}
        t={t}
      />

      <SubcategoryModal
        isOpen={isSubcategoryEditOpen}
        title={t("resource.categories.subcategories.edit.title")}
        submitLabel={t("resource.common.actions.saveChanges")}
        isSubmitting={updateSubcategoryMutation.isPending}
        onClose={closeEditSubcategoryModal}
        onSubmit={handleEditSubcategory}
        error={editSubcategoryError}
        errorTitle={t("resource.common.errors.updateFailed")}
        formKey={editSubcategoryKey}
        categoryOptions={categoryOptions}
        colorOptions={colorOptions}
        state={editSubcategoryState}
        handlers={editSubcategoryHandlers}
        t={t}
      />

      <Modal
        isOpen={isSuccessOpen}
        onClose={closeSuccessModal}
        className="m-4 w-full max-w-[520px]"
      >
        <div className="p-6 space-y-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <CheckCircle size={56} weight="fill" className="text-success-500" />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {t("resource.categories.create.successTitle")}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("resource.categories.create.successMessage")}
              </p>
            </div>
          </div>
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={closeSuccessModal}
            >
              {t("resource.common.actions.close")}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
        className="m-4 w-full max-w-[520px]"
      >
        <div className="p-6 space-y-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <WarningCircle size={56} weight="fill" className="text-warning-500" />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {deleteTitle}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {deleteSubtitle}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {deleteMessage}
              </p>
            </div>
          </div>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={closeDeleteModal}
            >
              {t("resource.common.actions.cancel")}
            </Button>
            <Button
              size="sm"
              type="button"
              disabled={
                deleteTarget?.type === "category"
                  ? deleteCategoryMutation.isPending
                  : deleteSubcategoryMutation.isPending
              }
              onClick={handleDelete}
            >
              {t("resource.common.actions.delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
