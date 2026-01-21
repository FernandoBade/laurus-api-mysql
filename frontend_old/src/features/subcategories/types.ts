import type { CategoryColor } from "@/shared/types/domain";

export type Subcategory = {
  id: number;
  name: string | null;
  active: boolean;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateSubcategoryPayload = {
  name: string;
  categoryId: number;
  active?: boolean;
};

export type UpdateSubcategoryPayload = Partial<CreateSubcategoryPayload>;

export type SubcategoryFormState = {
  name: string;
  categoryId: string;
  color: CategoryColor;
  typeLabel: string;
};

export type SubcategoryFormHandlers = {
  onNameChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
};

type TranslationFn = (key: string, options?: Record<string, unknown>) => string;

export type SubcategoryModalProps = {
  isOpen: boolean;
  title: string;
  submitLabel: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
  errorTitle: string;
  formKey: number;
  categoryOptions: { value: string; label: string }[];
  colorOptions: { value: CategoryColor; label: string }[];
  state: SubcategoryFormState;
  handlers: SubcategoryFormHandlers;
  t: TranslationFn;
};
