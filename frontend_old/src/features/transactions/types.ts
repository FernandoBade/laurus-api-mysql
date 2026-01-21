import type { TransactionSource, TransactionType } from "@/shared/types/domain";

export type Transaction = {
  id: number;
  value: string;
  date: string;
  transactionType: TransactionType;
  observation: string | null;
  transactionSource: TransactionSource;
  isInstallment: boolean;
  totalMonths: number | null;
  isRecurring: boolean;
  paymentDay: number | null;
  active: boolean;
  accountId: number | null;
  creditCardId: number | null;
  categoryId: number | null;
  subcategoryId: number | null;
  tags?: number[];
  createdAt: string;
  updatedAt: string;
};

export type TransactionGroup = {
  accountId: number;
  transactions: Transaction[] | undefined;
};

export type CreateTransactionPayload = {
  value: number;
  date: string;
  categoryId?: number;
  subcategoryId?: number;
  observation?: string;
  transactionType: TransactionType;
  transactionSource: TransactionSource;
  isInstallment: boolean;
  totalMonths?: number;
  isRecurring: boolean;
  paymentDay?: number;
  accountId?: number;
  creditCardId?: number;
  tags?: number[];
  active?: boolean;
};

export type UpdateTransactionPayload = Partial<CreateTransactionPayload>;

export type TransactionFormState = {
  value: string;
  date: string;
  categoryId: string;
  subcategoryId: string;
  transactionType: TransactionType;
  transactionSource: TransactionSource;
  accountId: string;
  cardId: string;
  isInstallment: boolean;
  totalMonths: string;
  isRecurring: boolean;
  paymentDay: string;
  tagIds: string[];
  observation: string;
};

export type TransactionFormHandlers = {
  onValueChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onTypeChange: (value: TransactionType) => void;
  onSourceChange: (value: TransactionSource) => void;
  onAccountChange: (value: string) => void;
  onCardChange: (value: string) => void;
  onInstallmentChange: (checked: boolean) => void;
  onTotalMonthsChange: (value: string) => void;
  onRecurringChange: (checked: boolean) => void;
  onPaymentDayChange: (value: string) => void;
  onTagChange: (ids: string[]) => void;
  onObservationChange: (value: string) => void;
};

export type TransactionSortKey =
  | "date"
  | "transactionType"
  | "transactionSource"
  | "category"
  | "tags"
  | "value";

export type TransactionSortDirection = "asc" | "desc";

export type DateRangeFilter = {
  start: string;
  end: string;
};

export type TranslationFn = (key: string, options?: Record<string, unknown>) => string;

export type TransactionModalProps = {
  isOpen: boolean;
  title: string;
  submitLabel: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
  errorTitle?: string;
  formKey: number;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  currencySymbol?: string;
  showTypeField?: boolean;
  dateFormat: string;
  datePickerPortal?: HTMLElement;
  typeOptions: { value: string; label: string }[];
  sourceOptions: { value: string; label: string }[];
  categoryOptions: { value: string; label: string }[];
  subcategoryOptions: { value: string; label: string }[];
  accountOptions: { value: string; label: string }[];
  cardOptions: { value: string; label: string }[];
  tagOptions: { value: string; text: string; selected: boolean }[];
  state: TransactionFormState;
  handlers: TransactionFormHandlers;
  t: TranslationFn;
};
