import type { CategoryColor, CategoryType } from "@/shared/types/domain";
import type { Subcategory } from "@/features/subcategories/types";

export type Category = {
  id: number;
  name: string | null;
  type: CategoryType;
  color: CategoryColor;
  active: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryPayload = {
  name: string;
  type: CategoryType;
  color?: CategoryColor;
  active?: boolean;
  userId: number;
};

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export type CategoryGroup = {
  category: Category;
  subcategories: Subcategory[];
};

export type CategorySortKey = "name" | "type";
export type CategorySortDirection = "asc" | "desc";

export type CategoryDeleteTarget =
  | { type: "category"; id: number }
  | { type: "subcategory"; id: number };

export type TranslationFn = (key: string, options?: Record<string, unknown>) => string;

export type CategoryFormState = {
  name: string;
  type: CategoryType;
  color: CategoryColor;
};

export type CategoryFormHandlers = {
  onNameChange: (value: string) => void;
  onTypeChange: (value: CategoryType) => void;
  onColorChange: (value: CategoryColor) => void;
};

export type CategoryModalProps = {
  isOpen: boolean;
  title: string;
  description?: string;
  submitLabel: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
  errorTitle: string;
  formKey: number;
  typeOptions: { value: string; label: string }[];
  colorOptions: { value: CategoryColor; label: string }[];
  state: CategoryFormState;
  handlers: CategoryFormHandlers;
  t: TranslationFn;
};
