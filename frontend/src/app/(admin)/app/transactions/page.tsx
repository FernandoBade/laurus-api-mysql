
"use client";

import React, { useEffect, useMemo, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import DatePicker from "@/components/form/date-picker";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Checkbox from "@/components/form/input/Checkbox";
import MultiSelect from "@/components/form/MultiSelect";
import TextArea from "@/components/form/input/TextArea";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthSession } from "@/features/auth/context";
import { useAccountsByUser } from "@/features/accounts/hooks";
import { useCreditCardsByUser } from "@/features/credit-cards/hooks";
import { useCategoriesByUser } from "@/features/categories/hooks";
import { useSubcategoriesByUser } from "@/features/subcategories/hooks";
import { useTagsByUser } from "@/features/tags/hooks";
import { useUser } from "@/features/users/hooks";
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from "@/features/transactions/hooks";
import type { Transaction } from "@/features/transactions/types";
import type {
  Currency,
  DateFormat,
  TransactionSource,
  TransactionType,
} from "@/shared/types/domain";
import { getResourceLanguage } from "@/shared/i18n";
import { getApiErrorMessage } from "@/shared/lib/api/errors";
import {
  formatMoney,
  toDateInputValue,
} from "@/shared/lib/formatters";
import { ErrorState } from "@/shared/ui";
import { useTranslation } from "react-i18next";
import {
  Archive,
  CaretDown,
  CaretUp,
  CaretUpDown,
  PencilSimple,
  Plus,
  Trash,
} from "@phosphor-icons/react";

type TransactionFormState = {
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

type TransactionFormHandlers = {
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

type SortKey =
  | "date"
  | "transactionType"
  | "transactionSource"
  | "category"
  | "tags"
  | "value";

type SortDirection = "asc" | "desc";

type DateRangeFilter = {
  start: string;
  end: string;
};

const resolveCurrencySymbol = (
  currency: Currency | undefined,
  locale: string
) => {
  if (!currency) {
    return undefined;
  }
  try {
    const parts = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).formatToParts(0);
    return parts.find((part) => part.type === "currency")?.value ?? currency;
  } catch {
    return currency;
  }
};

const formatAmountValue = (amount: number, locale: string) =>
  new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  }).format(amount);

const formatAmountInput = (rawValue: string, locale: string) => {
  const digits = rawValue.replace(/\D/g, "");
  if (!digits) {
    return "";
  }
  const amount = Number(digits) / 100;
  return formatAmountValue(amount, locale);
};

const parseAmountInput = (rawValue: string) => {
  const digits = rawValue.replace(/\D/g, "");
  if (!digits) {
    return null;
  }
  return Number(digits) / 100;
};

const padDatePart = (value: number) => String(value).padStart(2, "0");

const parseDateParts = (value: string | Date | null | undefined) => {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
};

const formatDateForPreference = (
  value: string | Date | null | undefined,
  format: DateFormat
) => {
  const parts = parseDateParts(value);
  if (!parts) {
    return "";
  }
  const day = padDatePart(parts.day);
  const month = padDatePart(parts.month);
  if (format === "MM/DD/YYYY") {
    return `${month}/${day}/${parts.year}`;
  }
  return `${day}/${month}/${parts.year}`;
};

const resolveFlatpickrFormat = (format: DateFormat) =>
  format === "MM/DD/YYYY" ? "m/d/Y" : "d/m/Y";

type TransactionModalProps = {
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
  t: (key: string, options?: Record<string, unknown>) => string;
};

const TransactionModal = ({
  isOpen,
  title,
  submitLabel,
  isSubmitting,
  onClose,
  onSubmit,
  error,
  errorTitle,
  formKey,
  showAdvanced,
  onToggleAdvanced,
  currencySymbol,
  showTypeField = true,
  dateFormat,
  datePickerPortal,
  typeOptions,
  sourceOptions,
  categoryOptions,
  subcategoryOptions,
  accountOptions,
  cardOptions,
  tagOptions,
  state,
  handlers,
  t,
}: TransactionModalProps) => {
  const advancedFieldsId = `transaction-advanced-${formKey}`;
  const datePickerId = `transaction-date-${formKey}`;
  const advancedToggleLabel = showAdvanced
    ? t("resource.transactions.actions.lessOptions")
    : t("resource.transactions.actions.moreOptions");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="m-4 w-full max-w-[900px]"
    >
      <div className="max-h-[90vh] overflow-y-auto p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h3>
        <form onSubmit={onSubmit} className="mt-5 space-y-5">
          <div key={formKey} className="space-y-5">
            {error && (
              <Alert
                variant="error"
                title={errorTitle ?? t("resource.common.errors.updateFailed")}
                message={error}
              />
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>
                  {t("resource.common.fields.value")}{" "}
                  <span className="text-error-500">*</span>
                </Label>
                {currencySymbol ? (
                  <div className="relative">
                    <span
                      className="pointer-events-none absolute left-0 top-1/2 z-10 inline-flex h-11 -translate-y-1/2 items-center justify-center border-r border-gray-200 py-3 pr-3 pl-3.5 text-gray-500 dark:border-gray-800 dark:text-gray-400"
                      aria-hidden="true"
                    >
                      {currencySymbol}
                    </span>
                    <Input
                      type="text"
                      placeholder={t("resource.common.placeholders.amount")}
                      name="value"
                      value={state.value}
                      onChange={(event) =>
                        handlers.onValueChange(event.target.value)
                      }
                      className="pl-[90px]"
                    />
                  </div>
                ) : (
                  <Input
                    type="text"
                    placeholder={t("resource.common.placeholders.amount")}
                    name="value"
                    value={state.value}
                    onChange={(event) =>
                      handlers.onValueChange(event.target.value)
                    }
                  />
                )}
              </div>
              <div>
                <Label>
                  {t("resource.common.fields.date")}{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <DatePicker
                  key={datePickerId}
                  id={datePickerId}
                  placeholder={t("resource.transactions.placeholders.date")}
                  dateFormat={dateFormat}
                  staticPosition={false}
                  appendTo={datePickerPortal}
                  defaultDate={state.date ? new Date(state.date) : undefined}
                  onChange={(dates) => {
                    const [selected] = dates;
                    handlers.onDateChange(
                      selected ? toDateInputValue(selected) : ""
                    );
                  }}
                />
              </div>
              {showTypeField && (
                <div>
                  <Label>
                    {t("resource.common.fields.type")}{" "}
                    <span className="text-error-500">*</span>
                  </Label>
                  <Select
                    key={`type-${formKey}`}
                    options={typeOptions}
                    defaultValue={state.transactionType}
                    onChange={(value) =>
                      handlers.onTypeChange(value as TransactionType)
                    }
                  />
                </div>
              )}
              <div>
                <Label>
                  {t("resource.common.fields.source")}{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <Select
                  key={`source-${formKey}`}
                  options={sourceOptions}
                  defaultValue={state.transactionSource}
                  onChange={(value) =>
                    handlers.onSourceChange(value as TransactionSource)
                  }
                />
              </div>
              {state.transactionSource === "account" ? (
                <div>
                  <Label>
                    {t("resource.common.fields.account")}{" "}
                    <span className="text-error-500">*</span>
                  </Label>
                  <Select
                    key={`account-${formKey}`}
                    options={accountOptions}
                    placeholder={t(
                      "resource.transactions.placeholders.selectAccount"
                    )}
                    defaultValue={state.accountId}
                    onChange={handlers.onAccountChange}
                  />
                </div>
              ) : (
                <div>
                  <Label>
                    {t("resource.common.fields.creditCard")}{" "}
                    <span className="text-error-500">*</span>
                  </Label>
                  <Select
                    key={`card-${formKey}`}
                    options={cardOptions}
                    placeholder={t(
                      "resource.transactions.placeholders.selectCard"
                    )}
                    defaultValue={state.cardId}
                    onChange={handlers.onCardChange}
                  />
                </div>
              )}
              <div>
                <Label>
                  {t("resource.common.fields.category")}{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <Select
                  key={`category-${formKey}-${state.transactionType}`}
                  options={categoryOptions}
                  placeholder={t(
                    "resource.transactions.placeholders.selectCategory"
                  )}
                  defaultValue={state.categoryId}
                  onChange={handlers.onCategoryChange}
                />
              </div>
              <div>
                <Label>{t("resource.transactions.fields.subcategory")}</Label>
                <Select
                  key={`subcategory-${formKey}-${state.categoryId}`}
                  options={subcategoryOptions}
                  placeholder={t(
                    "resource.transactions.placeholders.selectSubcategory"
                  )}
                  defaultValue={state.subcategoryId}
                  onChange={handlers.onSubcategoryChange}
                />
              </div>
            </div>
            <div>
              <button
                type="button"
                onClick={onToggleAdvanced}
                aria-expanded={showAdvanced}
                aria-controls={advancedFieldsId}
                className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                {advancedToggleLabel}
              </button>
            </div>
            {showAdvanced && (
              <div
                id={advancedFieldsId}
                className="grid gap-4 md:grid-cols-2"
              >
                <div className="space-y-2">
                  <Checkbox
                    checked={state.isInstallment}
                    onChange={handlers.onInstallmentChange}
                    label={t("resource.transactions.fields.installment")}
                    disabled={state.isRecurring}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("resource.transactions.helpers.installment")}
                  </p>
                </div>
                <div className="space-y-2">
                  <Checkbox
                    checked={state.isRecurring}
                    onChange={handlers.onRecurringChange}
                    label={t("resource.transactions.fields.recurring")}
                    disabled={state.isInstallment}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("resource.transactions.helpers.recurring")}
                  </p>
                </div>
                {state.isInstallment && (
                  <div>
                    <Label>{t("resource.transactions.fields.totalMonths")}</Label>
                    <Input
                      type="number"
                      min="2"
                      max="999"
                      name="totalMonths"
                      placeholder={t(
                        "resource.transactions.placeholders.totalMonths"
                      )}
                      defaultValue={state.totalMonths}
                      onChange={(event) =>
                        handlers.onTotalMonthsChange(event.target.value)
                      }
                      hint={t("resource.transactions.helpers.totalMonths")}
                    />
                  </div>
                )}
                {state.isRecurring && (
                  <div>
                    <Label>{t("resource.transactions.fields.paymentDay")}</Label>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      name="paymentDay"
                      placeholder={t(
                        "resource.transactions.placeholders.paymentDay"
                      )}
                      defaultValue={state.paymentDay}
                      onChange={(event) =>
                        handlers.onPaymentDayChange(event.target.value)
                      }
                      hint={t("resource.transactions.helpers.paymentDay")}
                    />
                  </div>
                )}
                <div className="md:col-span-2">
                  <MultiSelect
                    key={`tags-${formKey}`}
                    label={t("resource.common.fields.tags")}
                    options={tagOptions}
                    defaultSelected={state.tagIds}
                    onChange={handlers.onTagChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>{t("resource.common.fields.observation")}</Label>
                  <TextArea
                    placeholder={t(
                      "resource.transactions.placeholders.observation"
                    )}
                    value={state.observation}
                    onChange={handlers.onObservationChange}
                  />
                </div>
              </div>
            )}
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
};

export default function TransactionsPage() {
  const { t } = useTranslation([
    "resource-transactions",
    "resource-common",
    "resource-accounts",
    "resource-creditCards",
    "resource-categories",
    "resource-tags",
  ]);
  const { userId } = useAuthSession();
  const { data: userResponse } = useUser(userId);
  const currency = userResponse?.data?.currency;
  const locale = getResourceLanguage();
  const preferredDateFormat = (userResponse?.data?.dateFormat ??
    "DD/MM/YYYY") as DateFormat;
  const datePickerFormat = resolveFlatpickrFormat(preferredDateFormat);
  const [datePickerPortal, setDatePickerPortal] = useState<
    HTMLElement | undefined
  >(undefined);
  useEffect(() => {
    setDatePickerPortal(document.body);
  }, []);
  const currencySymbol = useMemo(
    () => resolveCurrencySymbol(currency, locale),
    [currency, locale]
  );
  const transactionsQuery = useTransactions({ sort: "date", order: "desc" });
  const accountsQuery = useAccountsByUser(userId);
  const cardsQuery = useCreditCardsByUser(userId);
  const categoriesQuery = useCategoriesByUser(userId);
  const subcategoriesQuery = useSubcategoriesByUser(userId);
  const tagsQuery = useTagsByUser(userId);
  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateAdvancedOpen, setIsCreateAdvancedOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [date, setDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [transactionType, setTransactionType] =
    useState<TransactionType>("expense");
  const [transactionSource, setTransactionSource] =
    useState<TransactionSource>("account");
  const [accountId, setAccountId] = useState("");
  const [cardId, setCardId] = useState("");
  const [isInstallment, setIsInstallment] = useState(false);
  const [totalMonths, setTotalMonths] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [paymentDay, setPaymentDay] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [observation, setObservation] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditAdvancedOpen, setIsEditAdvancedOpen] = useState(false);
  const [editKey, setEditKey] = useState(0);
  const [editError, setEditError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editSubcategoryId, setEditSubcategoryId] = useState("");
  const [editTransactionType, setEditTransactionType] =
    useState<TransactionType>("expense");
  const [editTransactionSource, setEditTransactionSource] =
    useState<TransactionSource>("account");
  const [editAccountId, setEditAccountId] = useState("");
  const [editCardId, setEditCardId] = useState("");
  const [editIsInstallment, setEditIsInstallment] = useState(false);
  const [editTotalMonths, setEditTotalMonths] = useState("");
  const [editIsRecurring, setEditIsRecurring] = useState(false);
  const [editPaymentDay, setEditPaymentDay] = useState("");
  const [editTagIds, setEditTagIds] = useState<string[]>([]);
  const [editObservation, setEditObservation] = useState("");

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewTransaction, setViewTransaction] = useState<Transaction | null>(
    null
  );

  const [filterType, setFilterType] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterCategoryId, setFilterCategoryId] = useState<string>("all");
  const [filterTagId, setFilterTagId] = useState<string>("all");
  const [filterDateRange, setFilterDateRange] = useState<DateRangeFilter>({
    start: "",
    end: "",
  });

  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const typeOptions = useMemo(
    () => [
      { value: "income", label: t("resource.transactions.types.income") },
      { value: "expense", label: t("resource.transactions.types.expense") },
    ],
    [t]
  );
  const sourceOptions = useMemo(
    () => [
      { value: "account", label: t("resource.transactions.sources.account") },
      {
        value: "creditCard",
        label: t("resource.transactions.sources.creditCard"),
      },
    ],
    [t]
  );
  const typeLabels = useMemo(
    () => new Map(typeOptions.map((option) => [option.value, option.label])),
    [typeOptions]
  );
  const sourceLabels = useMemo(
    () => new Map(sourceOptions.map((option) => [option.value, option.label])),
    [sourceOptions]
  );
  const filterTypeOptions = useMemo(
    () => [
      {
        value: "all",
        label: t("resource.transactions.filters.options.allTypes"),
      },
      ...typeOptions,
    ],
    [t, typeOptions]
  );
  const filterSourceOptions = useMemo(
    () => [
      {
        value: "all",
        label: t("resource.transactions.filters.options.allSources"),
      },
      ...sourceOptions,
    ],
    [sourceOptions, t]
  );

  const accounts = useMemo(
    () => accountsQuery.data?.data ?? [],
    [accountsQuery.data]
  );
  const cards = useMemo(() => cardsQuery.data?.data ?? [], [cardsQuery.data]);
  const categories = useMemo(
    () => categoriesQuery.data?.data ?? [],
    [categoriesQuery.data]
  );
  const subcategories = useMemo(
    () => subcategoriesQuery.data?.data ?? [],
    [subcategoriesQuery.data]
  );
  const tags = useMemo(() => tagsQuery.data?.data ?? [], [tagsQuery.data]);

  useEffect(() => {
    if (filterCategoryId === "all") {
      return;
    }
    const selected = categories.find(
      (category) => String(category.id) === filterCategoryId
    );
    if (!selected) {
      setFilterCategoryId("all");
      return;
    }
    if (filterType !== "all" && selected.type !== filterType) {
      setFilterCategoryId("all");
    }
  }, [categories, filterCategoryId, filterType]);

  const accountOptions = useMemo(
    () =>
      accounts.map((account) => ({
        value: String(account.id),
        label:
          account.name ||
          t("resource.accounts.fallbacks.accountWithId", { id: account.id }),
      })),
    [accounts, t]
  );

  const cardOptions = useMemo(
    () =>
      cards.map((card) => ({
        value: String(card.id),
        label:
          card.name ||
          t("resource.creditCards.fallbacks.cardWithId", { id: card.id }),
      })),
    [cards, t]
  );

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((category) => category.type === transactionType)
        .map((category) => ({
          value: String(category.id),
          label:
            category.name ||
            t("resource.categories.fallbacks.categoryWithId", {
              id: category.id,
            }),
        })),
    [categories, transactionType, t]
  );

  const editCategoryOptions = useMemo(
    () =>
      categories
        .filter((category) => category.type === editTransactionType)
        .map((category) => ({
          value: String(category.id),
          label:
            category.name ||
            t("resource.categories.fallbacks.categoryWithId", {
              id: category.id,
            }),
        })),
    [categories, editTransactionType, t]
  );

  const filterCategoryOptions = useMemo(() => {
    const filtered =
      filterType === "all"
        ? categories
        : categories.filter((category) => category.type === filterType);
    return [
      {
        value: "all",
        label: t("resource.transactions.filters.options.allCategories"),
      },
      ...filtered.map((category) => ({
        value: String(category.id),
        label:
          category.name ||
          t("resource.categories.fallbacks.categoryWithId", {
            id: category.id,
          }),
      })),
    ];
  }, [categories, filterType, t]);

  const subcategoryOptions = useMemo(() => {
    if (!categoryId) {
      return [];
    }
    const selectedCategory = Number(categoryId);
    return subcategories
      .filter((subcategory) => subcategory.categoryId === selectedCategory)
      .map((subcategory) => ({
        value: String(subcategory.id),
        label:
          subcategory.name ||
          t("resource.transactions.fallbacks.subcategoryWithId", {
            id: subcategory.id,
          }),
      }));
  }, [categoryId, subcategories, t]);

  const editSubcategoryOptions = useMemo(() => {
    if (!editCategoryId) {
      return [];
    }
    const selectedCategory = Number(editCategoryId);
    return subcategories
      .filter((subcategory) => subcategory.categoryId === selectedCategory)
      .map((subcategory) => ({
        value: String(subcategory.id),
        label:
          subcategory.name ||
          t("resource.transactions.fallbacks.subcategoryWithId", {
            id: subcategory.id,
          }),
      }));
  }, [editCategoryId, subcategories, t]);

  const tagOptions = useMemo(
    () =>
      tags.map((tag) => ({
        value: String(tag.id),
        text: tag.name || t("resource.tags.fallbacks.tagWithId", { id: tag.id }),
        selected: false,
      })),
    [tags, t]
  );

  const tagFilterOptions = useMemo(
    () => [
      {
        value: "all",
        label: t("resource.transactions.filters.options.allTags"),
      },
      ...tags.map((tag) => ({
        value: String(tag.id),
        label:
          tag.name || t("resource.tags.fallbacks.tagWithId", { id: tag.id }),
      })),
    ],
    [tags, t]
  );

  const accountMap = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.name])),
    [accounts]
  );
  const cardMap = useMemo(
    () => new Map(cards.map((card) => [card.id, card.name])),
    [cards]
  );
  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  );
  const subcategoryById = useMemo(
    () =>
      new Map(
        subcategories.map((subcategory) => [subcategory.id, subcategory])
      ),
    [subcategories]
  );
  const tagMap = useMemo(
    () =>
      new Map(
        tags.map((tag) => [
          tag.id,
          tag.name || t("resource.tags.fallbacks.tagWithId", { id: tag.id }),
        ])
      ),
    [tags, t]
  );

  const resolveCategoryId = (transaction: Transaction) =>
    transaction.categoryId ??
    subcategoryById.get(transaction.subcategoryId ?? -1)?.categoryId ??
    null;

  const resolveCategoryLabel = (transaction: Transaction) => {
    const categoryId = resolveCategoryId(transaction);
    if (!categoryId) {
      return t("resource.common.placeholders.emptyValue");
    }
    return (
      categoryMap.get(categoryId) ||
      t("resource.categories.fallbacks.categoryWithId", { id: categoryId })
    );
  };

  const resolveSourceLabel = (transaction: Transaction) => {
    if (transaction.transactionSource === "account") {
      return (
        accountMap.get(transaction.accountId ?? -1) ||
        t("resource.accounts.fallbacks.accountWithId", {
          id: transaction.accountId ?? "-",
        })
      );
    }
    return (
      cardMap.get(transaction.creditCardId ?? -1) ||
      t("resource.creditCards.fallbacks.cardWithId", {
        id: transaction.creditCardId ?? "-",
      })
    );
  };

  const resolveTagLabels = (transaction: Transaction) => {
    const tagIds = transaction.tags ?? [];
    if (!tagIds.length) {
      return t("resource.common.placeholders.emptyValue");
    }
    return tagIds
      .map((tagId) =>
        tagMap.get(tagId) ||
        t("resource.tags.fallbacks.tagWithId", { id: tagId })
      )
      .join(", ");
  };

  const filteredTransactions = useMemo(() => {
    const transactions = transactionsQuery.data?.data ?? [];
    const accountIds = new Set(accounts.map((account) => account.id));
    const cardIds = new Set(cards.map((card) => card.id));
    let filtered = transactions.filter((transaction) => {
      if (!accounts.length && !cards.length) {
        return true;
      }
      return (
        (transaction.accountId && accountIds.has(transaction.accountId)) ||
        (transaction.creditCardId && cardIds.has(transaction.creditCardId))
      );
    });

    if (filterType !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.transactionType === filterType
      );
    }
    if (filterSource !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.transactionSource === filterSource
      );
    }
    if (filterCategoryId !== "all") {
      const selectedCategoryId = Number(filterCategoryId);
      filtered = filtered.filter((transaction) => {
        const effectiveCategoryId =
          transaction.categoryId ??
          subcategoryById.get(transaction.subcategoryId ?? -1)?.categoryId ??
          null;
        return effectiveCategoryId === selectedCategoryId;
      });
    }
    if (filterTagId !== "all") {
      const selectedTagId = Number(filterTagId);
      filtered = filtered.filter((transaction) =>
        (transaction.tags ?? []).includes(selectedTagId)
      );
    }
    if (filterDateRange.start || filterDateRange.end) {
      const start = filterDateRange.start
        ? new Date(filterDateRange.start)
        : null;
      const end = filterDateRange.end
        ? new Date(filterDateRange.end)
        : null;
      filtered = filtered.filter((transaction) => {
        const date = new Date(transaction.date);
        if (Number.isNaN(date.getTime())) {
          return false;
        }
        if (start && date < start) {
          return false;
        }
        if (end && date > end) {
          return false;
        }
        return true;
      });
    }

    return filtered;
  }, [
    transactionsQuery.data,
    accounts,
    cards,
    filterType,
    filterSource,
    filterCategoryId,
    filterTagId,
    filterDateRange,
    subcategoryById,
  ]);

  const sortedTransactions = useMemo(() => {
    const sorted = [...filteredTransactions];
    const compare = (left: Transaction, right: Transaction) => {
      if (sortKey === "date") {
        return (
          new Date(left.date).getTime() - new Date(right.date).getTime()
        );
      }
      if (sortKey === "transactionType") {
        return (typeLabels.get(left.transactionType) || left.transactionType).localeCompare(
          typeLabels.get(right.transactionType) || right.transactionType
        );
      }
      if (sortKey === "transactionSource") {
        return resolveSourceLabel(left).localeCompare(resolveSourceLabel(right));
      }
      if (sortKey === "category") {
        return resolveCategoryLabel(left).localeCompare(resolveCategoryLabel(right));
      }
      if (sortKey === "tags") {
        return resolveTagLabels(left).localeCompare(resolveTagLabels(right));
      }
      if (sortKey === "value") {
        return Number(left.value) - Number(right.value);
      }
      return 0;
    };
    sorted.sort((left, right) => {
      const result = compare(left, right);
      return sortDirection === "asc" ? result : -result;
    });
    return sorted;
  }, [
    filteredTransactions,
    resolveCategoryLabel,
    resolveSourceLabel,
    resolveTagLabels,
    sortDirection,
    sortKey,
    typeLabels,
  ]);

  const resetForm = (nextType: TransactionType = "expense") => {
    setValue("");
    setDate("");
    setCategoryId("");
    setSubcategoryId("");
    setTransactionType(nextType);
    setTransactionSource("account");
    setAccountId("");
    setCardId("");
    setIsInstallment(false);
    setTotalMonths("");
    setIsRecurring(false);
    setPaymentDay("");
    setTagIds([]);
    setObservation("");
    setFormKey((prev) => prev + 1);
  };

  const validateTransaction = ({
    amount,
    dateValue,
    categoryValue,
    source,
    accountValue,
    cardValue,
    installment,
    months,
    recurring,
    paymentValue,
  }: {
    amount: string;
    dateValue: string;
    categoryValue: string;
    source: TransactionSource;
    accountValue: string;
    cardValue: string;
    installment: boolean;
    months: string;
    recurring: boolean;
    paymentValue: string;
  }) => {
    const numericAmount = parseAmountInput(amount);
    if (numericAmount === null || numericAmount <= 0) {
      return t("resource.transactions.validation.amountPositive");
    }
    if (!dateValue) {
      return t("resource.transactions.validation.dateRequired");
    }
    if (!categoryValue) {
      return t("resource.transactions.validation.categoryRequired");
    }
    if (source === "account" && !accountValue) {
      return t("resource.transactions.validation.accountRequired");
    }
    if (source === "creditCard" && !cardValue) {
      return t("resource.transactions.validation.cardRequired");
    }
    if (installment && recurring) {
      return t("resource.transactions.validation.invalidInstallmentRecurring");
    }
    if (installment) {
      if (!months) {
        return t("resource.transactions.validation.installmentMonthsRequired");
      }
      const parsedMonths = Number(months);
      if (
        Number.isNaN(parsedMonths) ||
        !Number.isInteger(parsedMonths) ||
        parsedMonths < 2 ||
        parsedMonths > 999
      ) {
        return t("resource.transactions.validation.installmentMonthsRange");
      }
    }
    if (recurring && !paymentValue) {
      return t("resource.transactions.validation.paymentDayRequired");
    }
    if (paymentValue) {
      const payment = Number(paymentValue);
      if (Number.isNaN(payment) || payment < 1 || payment > 31) {
        return t("resource.transactions.validation.paymentDayRange");
      }
    }
    return null;
  };

  const openCreateModal = (type: TransactionType) => {
    resetForm(type);
    setFormError(null);
    setIsCreateAdvancedOpen(false);
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const validationError = validateTransaction({
      amount: value,
      dateValue: date,
      categoryValue: categoryId,
      source: transactionSource,
      accountValue: accountId,
      cardValue: cardId,
      installment: isInstallment,
      months: totalMonths,
      recurring: isRecurring,
      paymentValue: paymentDay,
    });
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const parsedAmount = parseAmountInput(value);
      if (parsedAmount === null) {
        setFormError(t("resource.transactions.validation.amountPositive"));
        return;
      }
      await createTransactionMutation.mutateAsync({
        value: parsedAmount,
        date,
        category_id: Number(categoryId),
        subcategory_id: subcategoryId ? Number(subcategoryId) : undefined,
        transactionType,
        transactionSource,
        account_id:
          transactionSource === "account" ? Number(accountId) : undefined,
        creditCard_id:
          transactionSource === "creditCard" ? Number(cardId) : undefined,
        isInstallment,
        totalMonths: isInstallment ? Number(totalMonths) : undefined,
        isRecurring,
        paymentDay: isRecurring ? Number(paymentDay) : undefined,
        tags: tagIds.length ? tagIds.map((id) => Number(id)) : undefined,
        observation: observation.trim() || undefined,
      });
      setIsCreateOpen(false);
      resetForm(transactionType);
    } catch (error) {
      setFormError(getApiErrorMessage(error, t("resource.common.errors.generic")));
    }
  };

  const openEditModal = (transaction: (typeof filteredTransactions)[number]) => {
    const fallbackCategoryId =
      transaction.categoryId ??
      subcategoryById.get(transaction.subcategoryId ?? -1)?.categoryId ??
      null;
    const numericValue = Number(transaction.value);
    setEditId(transaction.id);
    setEditValue(
      Number.isNaN(numericValue) ? "" : formatAmountValue(numericValue, locale)
    );
    setEditDate(toDateInputValue(transaction.date));
    setEditCategoryId(fallbackCategoryId ? String(fallbackCategoryId) : "");
    setEditSubcategoryId(
      transaction.subcategoryId ? String(transaction.subcategoryId) : ""
    );
    setEditTransactionType(transaction.transactionType);
    setEditTransactionSource(transaction.transactionSource);
    setEditAccountId(transaction.accountId ? String(transaction.accountId) : "");
    setEditCardId(transaction.creditCardId ? String(transaction.creditCardId) : "");
    setEditIsInstallment(transaction.isInstallment);
    setEditTotalMonths(transaction.totalMonths ? String(transaction.totalMonths) : "");
    setEditIsRecurring(transaction.isRecurring);
    setEditPaymentDay(transaction.paymentDay ? String(transaction.paymentDay) : "");
    setEditTagIds((transaction.tags ?? []).map(String));
    setEditObservation(transaction.observation || "");
    setEditError(null);
    setEditKey((prev) => prev + 1);
    setIsEditAdvancedOpen(false);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
  };

  const openViewModal = (transaction: Transaction) => {
    setViewTransaction(transaction);
    setIsViewOpen(true);
  };

  const closeViewModal = () => {
    setIsViewOpen(false);
    setViewTransaction(null);
  };

  const handleEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEditError(null);

    if (!editId) {
      setEditError(t("resource.transactions.errors.notSelected"));
      return;
    }

    const validationError = validateTransaction({
      amount: editValue,
      dateValue: editDate,
      categoryValue: editCategoryId,
      source: editTransactionSource,
      accountValue: editAccountId,
      cardValue: editCardId,
      installment: editIsInstallment,
      months: editTotalMonths,
      recurring: editIsRecurring,
      paymentValue: editPaymentDay,
    });
    if (validationError) {
      setEditError(validationError);
      return;
    }

    try {
      const parsedAmount = parseAmountInput(editValue);
      if (parsedAmount === null) {
        setEditError(t("resource.transactions.validation.amountPositive"));
        return;
      }
      await updateTransactionMutation.mutateAsync({
        id: editId,
        payload: {
          value: parsedAmount,
          date: editDate,
          category_id: Number(editCategoryId),
          subcategory_id: editSubcategoryId
            ? Number(editSubcategoryId)
            : undefined,
          transactionType: editTransactionType,
          transactionSource: editTransactionSource,
          account_id:
            editTransactionSource === "account"
              ? Number(editAccountId)
              : undefined,
          creditCard_id:
            editTransactionSource === "creditCard"
              ? Number(editCardId)
              : undefined,
          isInstallment: editIsInstallment,
          totalMonths: editIsInstallment ? Number(editTotalMonths) : undefined,
          isRecurring: editIsRecurring,
          paymentDay: editIsRecurring ? Number(editPaymentDay) : undefined,
          tags: editTagIds.length
            ? editTagIds.map((id) => Number(id))
            : undefined,
          observation: editObservation.trim() || undefined,
        },
      });
      setIsEditOpen(false);
    } catch (error) {
      setEditError(getApiErrorMessage(error, t("resource.common.errors.generic")));
    }
  };

  const openDeleteModal = (id: number) => {
    setDeleteTargetId(id);
    setIsDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
    setDeleteTargetId(null);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) {
      return;
    }
    try {
      await deleteTransactionMutation.mutateAsync(deleteTargetId);
      closeDeleteModal();
    } catch {
      // Error handled by mutation state.
    }
  };

  const handleArchive = async (
    transaction: (typeof filteredTransactions)[number]
  ) => {
    if (!transaction.active) {
      return;
    }
    if (!transaction.categoryId && !transaction.subcategoryId) {
      return;
    }
    try {
      await updateTransactionMutation.mutateAsync({
        id: transaction.id,
        payload: {
          active: false,
          category_id: transaction.categoryId ?? undefined,
          subcategory_id: transaction.subcategoryId ?? undefined,
        },
      });
    } catch {
      // Error handled by mutation state.
    }
  };

  const handleTransactionTypeChange = (value: TransactionType) => {
    setTransactionType(value);
    setCategoryId("");
    setSubcategoryId("");
  };

  const handleEditTransactionTypeChange = (value: TransactionType) => {
    setEditTransactionType(value);
    setEditCategoryId("");
    setEditSubcategoryId("");
  };

  const handleTransactionSourceChange = (value: TransactionSource) => {
    setTransactionSource(value);
    setAccountId("");
    setCardId("");
  };

  const handleEditTransactionSourceChange = (value: TransactionSource) => {
    setEditTransactionSource(value);
    setEditAccountId("");
    setEditCardId("");
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    setSubcategoryId("");
  };

  const handleEditCategoryChange = (value: string) => {
    setEditCategoryId(value);
    setEditSubcategoryId("");
  };

  const handleInstallmentChange = (checked: boolean) => {
    setIsInstallment(checked);
    if (checked) {
      setIsRecurring(false);
      setPaymentDay("");
    }
    if (!checked) {
      setTotalMonths("");
    }
  };

  const handleRecurringChange = (checked: boolean) => {
    setIsRecurring(checked);
    if (checked) {
      setIsInstallment(false);
      setTotalMonths("");
    }
    if (!checked) {
      setPaymentDay("");
    }
  };

  const handleEditInstallmentChange = (checked: boolean) => {
    setEditIsInstallment(checked);
    if (checked) {
      setEditIsRecurring(false);
      setEditPaymentDay("");
    }
    if (!checked) {
      setEditTotalMonths("");
    }
  };

  const handleEditRecurringChange = (checked: boolean) => {
    setEditIsRecurring(checked);
    if (checked) {
      setEditIsInstallment(false);
      setEditTotalMonths("");
    }
    if (!checked) {
      setEditPaymentDay("");
    }
  };

  const handleSortChange = (key: SortKey) => {
    setSortKey((currentKey) => {
      if (currentKey === key) {
        setSortDirection((currentDirection) =>
          currentDirection === "asc" ? "desc" : "asc"
        );
        return currentKey;
      }
      setSortDirection("asc");
      return key;
    });
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

  const renderCreateActions = (className = "") => (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <Button
        size="sm"
        type="button"
        className="text-theme-sm"
        startIcon={<Plus size={16} />}
        onClick={() => openCreateModal("expense")}
      >
        {t("resource.transactions.actions.addExpense")}
      </Button>
      <Button
        size="sm"
        type="button"
        className="text-theme-sm"
        startIcon={<Plus size={16} />}
        onClick={() => openCreateModal("income")}
      >
        {t("resource.transactions.actions.addIncome")}
      </Button>
    </div>
  );

  const createModalState: TransactionFormState = {
    value,
    date,
    categoryId,
    subcategoryId,
    transactionType,
    transactionSource,
    accountId,
    cardId,
    isInstallment,
    totalMonths,
    isRecurring,
    paymentDay,
    tagIds,
    observation,
  };

  const createModalHandlers: TransactionFormHandlers = {
    onValueChange: (nextValue) =>
      setValue(formatAmountInput(nextValue, locale)),
    onDateChange: setDate,
    onCategoryChange: handleCategoryChange,
    onSubcategoryChange: setSubcategoryId,
    onTypeChange: handleTransactionTypeChange,
    onSourceChange: handleTransactionSourceChange,
    onAccountChange: setAccountId,
    onCardChange: setCardId,
    onInstallmentChange: handleInstallmentChange,
    onTotalMonthsChange: setTotalMonths,
    onRecurringChange: handleRecurringChange,
    onPaymentDayChange: setPaymentDay,
    onTagChange: setTagIds,
    onObservationChange: setObservation,
  };

  const editModalState: TransactionFormState = {
    value: editValue,
    date: editDate,
    categoryId: editCategoryId,
    subcategoryId: editSubcategoryId,
    transactionType: editTransactionType,
    transactionSource: editTransactionSource,
    accountId: editAccountId,
    cardId: editCardId,
    isInstallment: editIsInstallment,
    totalMonths: editTotalMonths,
    isRecurring: editIsRecurring,
    paymentDay: editPaymentDay,
    tagIds: editTagIds,
    observation: editObservation,
  };

  const editModalHandlers: TransactionFormHandlers = {
    onValueChange: (nextValue) =>
      setEditValue(formatAmountInput(nextValue, locale)),
    onDateChange: setEditDate,
    onCategoryChange: handleEditCategoryChange,
    onSubcategoryChange: setEditSubcategoryId,
    onTypeChange: handleEditTransactionTypeChange,
    onSourceChange: handleEditTransactionSourceChange,
    onAccountChange: setEditAccountId,
    onCardChange: setEditCardId,
    onInstallmentChange: handleEditInstallmentChange,
    onTotalMonthsChange: setEditTotalMonths,
    onRecurringChange: handleEditRecurringChange,
    onPaymentDayChange: setEditPaymentDay,
    onTagChange: setEditTagIds,
    onObservationChange: setEditObservation,
  };

  const renderSortableHeader = (label: string, key: SortKey) => (
    <button
      type="button"
      onClick={() => handleSortChange(key)}
      className="inline-flex items-center gap-1"
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
          {renderSortableHeader(t("resource.common.fields.date"), "date")}
        </TableCell>
        <TableCell
          isHeader
          className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
        >
          {renderSortableHeader(t("resource.common.fields.type"), "transactionType")}
        </TableCell>
        <TableCell
          isHeader
          className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
        >
          {renderSortableHeader(t("resource.common.fields.source"), "transactionSource")}
        </TableCell>
        <TableCell
          isHeader
          className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
        >
          {renderSortableHeader(t("resource.common.fields.category"), "category")}
        </TableCell>
        <TableCell
          isHeader
          className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
        >
          {renderSortableHeader(t("resource.common.fields.tags"), "tags")}
        </TableCell>
        <TableCell
          isHeader
          className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
        >
          {renderSortableHeader(t("resource.common.fields.amount"), "value")}
        </TableCell>
        <TableCell
          isHeader
          className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
        >
          {t("resource.common.fields.actions")}
        </TableCell>
      </TableRow>
    </TableHeader>
  );

  const createModalTitle =
    transactionType === "expense"
      ? t("resource.transactions.actions.addExpense")
      : t("resource.transactions.actions.addIncome");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {t("resource.transactions.title")}
        </h2>
        {renderCreateActions()}
      </div>

      <ComponentCard
        title={t("resource.transactions.list.title")}
        desc={t("resource.transactions.list.desc")}
      >
        {transactionsQuery.isError && (
          <ErrorState
            title={t("resource.transactions.list.unavailable")}
            message={getApiErrorMessage(
              transactionsQuery.error,
              t("resource.common.errors.generic")
            )}
          />
        )}
        {deleteTransactionMutation.isError && (
          <ErrorState
            title={t("resource.common.errors.deleteFailed")}
            message={getApiErrorMessage(
              deleteTransactionMutation.error,
              t("resource.common.errors.generic")
            )}
          />
        )}
        {!transactionsQuery.isError && (
          <>
            <div className="mb-6 rounded-xl border border-gray-100 p-4 dark:border-white/[0.05]">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div>
                  <Label>{t("resource.transactions.filters.type")}</Label>
                  <Select
                    key={`filter-type-${filterType}`}
                    options={filterTypeOptions}
                    defaultValue={filterType}
                    onChange={setFilterType}
                    placeholder={t(
                      "resource.transactions.filters.placeholders.type"
                    )}
                  />
                </div>
                <div>
                  <Label>{t("resource.transactions.filters.source")}</Label>
                  <Select
                    key={`filter-source-${filterSource}`}
                    options={filterSourceOptions}
                    defaultValue={filterSource}
                    onChange={setFilterSource}
                    placeholder={t(
                      "resource.transactions.filters.placeholders.source"
                    )}
                  />
                </div>
                <div>
                  <Label>{t("resource.transactions.filters.category")}</Label>
                  <Select
                    key={`filter-category-${filterType}-${filterCategoryId}`}
                    options={filterCategoryOptions}
                    defaultValue={filterCategoryId}
                    onChange={setFilterCategoryId}
                    placeholder={t(
                      "resource.transactions.filters.placeholders.category"
                    )}
                  />
                </div>
                <div>
                  <Label>{t("resource.transactions.filters.tag")}</Label>
                  <Select
                    key={`filter-tag-${filterTagId}`}
                    options={tagFilterOptions}
                    defaultValue={filterTagId}
                    onChange={setFilterTagId}
                    placeholder={t(
                      "resource.transactions.filters.placeholders.tag"
                    )}
                  />
                </div>
                <div>
                  <DatePicker
                    id="transactions-date-range"
                    mode="range"
                    label={t("resource.transactions.filters.dateRange")}
                    placeholder={t(
                      "resource.transactions.placeholders.dateRange"
                    )}
                    dateFormat={datePickerFormat}
                    staticPosition={false}
                    appendTo={datePickerPortal}
                    onChange={(dates) => {
                      const [start, end] = dates;
                      setFilterDateRange({
                        start: start ? toDateInputValue(start) : "",
                        end: end ? toDateInputValue(end) : "",
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            {transactionsQuery.isLoading ? (
              <div className="overflow-x-auto">
                <div className="min-w-[980px]">
                  <Table>
                    {tableHeader}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <TableRow key={`skeleton-${index}`} className="animate-pulse">
                          <TableCell className="px-5 py-4">
                            <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-800" />
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-800" />
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-800" />
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <div className="h-3 w-28 rounded bg-gray-200 dark:bg-gray-800" />
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-800" />
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-800" />
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <div className="h-8 w-40 rounded bg-gray-200 dark:bg-gray-800" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : sortedTransactions.length === 0 ? (
              <div className="space-y-4">
                <Alert
                  variant="info"
                  title={t("resource.transactions.list.empty")}
                  message={t("resource.transactions.list.emptyHelper")}
                />
                {renderCreateActions()}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[980px]">
                  <Table>
                    {tableHeader}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {sortedTransactions.map((transaction) => (
                        <TableRow
                          key={transaction.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => openViewModal(transaction)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              openViewModal(transaction);
                            }
                          }}
                          className="cursor-pointer transition hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                        >
                          <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {formatDateForPreference(
                              transaction.date,
                              preferredDateFormat
                            )}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {typeLabels.get(transaction.transactionType) ??
                              transaction.transactionType}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {resolveSourceLabel(transaction)}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {resolveCategoryLabel(transaction)}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {resolveTagLabels(transaction)}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                            {currency
                              ? formatMoney(transaction.value, { currency })
                              : formatMoney(transaction.value)}
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="!h-9 !w-9 !px-0 !py-0"
                                title={t("resource.common.actions.edit")}
                                ariaLabel={t("resource.common.actions.edit")}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openEditModal(transaction);
                                }}
                              >
                                <PencilSimple size={16} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="!h-9 !w-9 !px-0 !py-0"
                                title={t("resource.transactions.actions.archive")}
                                ariaLabel={t(
                                  "resource.transactions.actions.archive"
                                )}
                                disabled={
                                  !transaction.active ||
                                  updateTransactionMutation.isPending
                                }
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleArchive(transaction);
                                }}
                              >
                                <Archive size={16} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="!h-9 !w-9 !px-0 !py-0"
                                title={t("resource.common.actions.delete")}
                                ariaLabel={t("resource.common.actions.delete")}
                                disabled={deleteTransactionMutation.isPending}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openDeleteModal(transaction.id);
                                }}
                              >
                                <Trash size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </>
        )}
      </ComponentCard>

      <TransactionModal
        isOpen={isCreateOpen}
        title={createModalTitle}
        submitLabel={t("resource.transactions.create.actions.submit")}
        isSubmitting={createTransactionMutation.isPending}
        onClose={closeCreateModal}
        onSubmit={handleCreate}
        error={formError}
        errorTitle={t("resource.transactions.create.errors.notCreated")}
        formKey={formKey}
        showAdvanced={isCreateAdvancedOpen}
        onToggleAdvanced={() =>
          setIsCreateAdvancedOpen((prev) => !prev)
        }
        currencySymbol={currencySymbol}
        showTypeField={false}
        dateFormat={datePickerFormat}
        datePickerPortal={datePickerPortal}
        typeOptions={typeOptions}
        sourceOptions={sourceOptions}
        categoryOptions={categoryOptions}
        subcategoryOptions={subcategoryOptions}
        accountOptions={accountOptions}
        cardOptions={cardOptions}
        tagOptions={tagOptions}
        state={createModalState}
        handlers={createModalHandlers}
        t={t}
      />

      <TransactionModal
        isOpen={isEditOpen}
        title={t("resource.transactions.edit.title")}
        submitLabel={t("resource.common.actions.saveChanges")}
        isSubmitting={updateTransactionMutation.isPending}
        onClose={closeEditModal}
        onSubmit={handleEdit}
        error={editError}
        errorTitle={t("resource.common.errors.updateFailed")}
        formKey={editKey}
        showAdvanced={isEditAdvancedOpen}
        onToggleAdvanced={() =>
          setIsEditAdvancedOpen((prev) => !prev)
        }
        currencySymbol={currencySymbol}
        dateFormat={datePickerFormat}
        datePickerPortal={datePickerPortal}
        typeOptions={typeOptions}
        sourceOptions={sourceOptions}
        categoryOptions={editCategoryOptions}
        subcategoryOptions={editSubcategoryOptions}
        accountOptions={accountOptions}
        cardOptions={cardOptions}
        tagOptions={tagOptions}
        state={editModalState}
        handlers={editModalHandlers}
        t={t}
      />

      <Modal isOpen={isViewOpen} onClose={closeViewModal} className="m-4 w-full max-w-[720px]">
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {t("resource.transactions.view.title")}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("resource.transactions.view.subtitle")}
            </p>
          </div>
          {viewTransaction && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t("resource.common.fields.type")}
                </p>
                <p className="text-sm text-gray-800 dark:text-white/90">
                  {typeLabels.get(viewTransaction.transactionType) ??
                    viewTransaction.transactionType}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t("resource.common.fields.source")}
                </p>
                <p className="text-sm text-gray-800 dark:text-white/90">
                  {sourceLabels.get(viewTransaction.transactionSource) ??
                    viewTransaction.transactionSource}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t("resource.common.fields.date")}
                </p>
                <p className="text-sm text-gray-800 dark:text-white/90">
                  {formatDateForPreference(
                    viewTransaction.date,
                    preferredDateFormat
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t("resource.common.fields.amount")}
                </p>
                <p className="text-sm text-gray-800 dark:text-white/90">
                  {currency
                    ? formatMoney(viewTransaction.value, { currency })
                    : formatMoney(viewTransaction.value)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t("resource.common.fields.category")}
                </p>
                <p className="text-sm text-gray-800 dark:text-white/90">
                  {resolveCategoryLabel(viewTransaction)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t("resource.transactions.fields.subcategory")}
                </p>
                <p className="text-sm text-gray-800 dark:text-white/90">
                  {viewTransaction.subcategoryId
                    ? subcategoryById.get(viewTransaction.subcategoryId)?.name ||
                      t("resource.transactions.fallbacks.subcategoryWithId", {
                        id: viewTransaction.subcategoryId,
                      })
                    : t("resource.common.placeholders.emptyValue")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t("resource.common.fields.tags")}
                </p>
                <p className="text-sm text-gray-800 dark:text-white/90">
                  {resolveTagLabels(viewTransaction)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t("resource.transactions.fields.installment")}
                </p>
                <p className="text-sm text-gray-800 dark:text-white/90">
                  {viewTransaction.isInstallment
                    ? t("resource.common.labels.yes")
                    : t("resource.common.labels.no")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t("resource.transactions.fields.recurring")}
                </p>
                <p className="text-sm text-gray-800 dark:text-white/90">
                  {viewTransaction.isRecurring
                    ? t("resource.common.labels.yes")
                    : t("resource.common.labels.no")}
                </p>
              </div>
              {viewTransaction.isInstallment && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t("resource.transactions.fields.totalMonths")}
                  </p>
                  <p className="text-sm text-gray-800 dark:text-white/90">
                    {viewTransaction.totalMonths ??
                      t("resource.common.placeholders.emptyValue")}
                  </p>
                </div>
              )}
              {viewTransaction.isRecurring && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t("resource.transactions.fields.paymentDay")}
                  </p>
                  <p className="text-sm text-gray-800 dark:text-white/90">
                    {viewTransaction.paymentDay ??
                      t("resource.common.placeholders.emptyValue")}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {viewTransaction.transactionSource === "account"
                    ? t("resource.common.fields.account")
                    : t("resource.common.fields.creditCard")}
                </p>
                <p className="text-sm text-gray-800 dark:text-white/90">
                  {resolveSourceLabel(viewTransaction)}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t("resource.common.fields.observation")}
                </p>
                <p className="text-sm text-gray-800 dark:text-white/90">
                  {viewTransaction.observation ||
                    t("resource.common.placeholders.emptyValue")}
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={closeViewModal}
            >
              {t("resource.common.actions.close")}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={closeDeleteModal}>
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("resource.transactions.delete.title")}
          </h3>
          <Alert
            variant="warning"
            title={t("resource.transactions.delete.warningTitle")}
            message={t("resource.transactions.delete.warningMessage")}
          />
          <div className="flex justify-end gap-3">
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
              disabled={deleteTransactionMutation.isPending}
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
