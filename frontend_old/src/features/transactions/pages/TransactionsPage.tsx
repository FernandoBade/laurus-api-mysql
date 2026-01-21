"use client";

import React, { useCallback, useMemo, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import DatePicker from "@/components/form/date-picker";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Checkbox from "@/components/form/input/Checkbox";
import MultiSelect from "@/components/form/MultiSelect";
import TextArea from "@/components/form/input/TextArea";
import { Modal } from "@/components/ui/modal";
import Pagination from "@/components/tables/Pagination";
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
import type {
  DateRangeFilter,
  Transaction,
  TransactionFormHandlers,
  TransactionFormState,
  TransactionModalProps,
  TransactionSortDirection as SortDirection,
  TransactionSortKey as SortKey,
} from "@/features/transactions/types";
import type {
  CategoryColor,
  Currency,
  DateFormat,
  TransactionSource,
  TransactionType,
} from "@/shared/types/domain";
import type { ApiListResponse } from "@/shared/types/api";
import { getResourceLanguage } from "@/shared/i18n";
import { getApiErrorMessage } from "@/shared/lib/api/errors";
import {
  formatMoney,
  toDateInputValue,
} from "@/shared/lib/formatters";
import { ErrorState } from "@/components/ui/states";
import { useTranslation } from "react-i18next";
import {
  Archive,
  CaretDown,
  CaretUp,
  CaretUpDown,
  CheckCircle,
  Copy,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react";

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

const normalizeSearchText = (value: string) => value.trim().toLowerCase();

const normalizeId = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
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
                  iconPosition="left"
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
  const datePickerPortal = useMemo(
    () => (typeof document === "undefined" ? undefined : document.body),
    []
  );
  const currencySymbol = useMemo(
    () => resolveCurrencySymbol(currency, locale),
    [currency, locale]
  );
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const isServerSortable = [
    "date",
    "transactionType",
    "transactionSource",
    "value",
  ].includes(sortKey);
  const serverSortKey = isServerSortable ? sortKey : "date";
  const serverSortDirection = isServerSortable ? sortDirection : "desc";
  const accountsQuery = useAccountsByUser(userId, { pageSize: 500 });
  const cardsQuery = useCreditCardsByUser(userId, { pageSize: 500 });
  const accountIdsParam = useMemo(() => {
    const ids = accountsQuery.data?.data?.map((account) => account.id) ?? [];
    ids.sort((a, b) => a - b);
    return ids.length ? ids.join(",") : undefined;
  }, [accountsQuery.data]);
  const creditCardIdsParam = useMemo(() => {
    const ids = cardsQuery.data?.data?.map((card) => card.id) ?? [];
    ids.sort((a, b) => a - b);
    return ids.length ? ids.join(",") : undefined;
  }, [cardsQuery.data]);
  const categoriesQuery = useCategoriesByUser(userId, { pageSize: 500 });
  const subcategoriesQuery = useSubcategoriesByUser(userId, { pageSize: 500 });
  const tagsQuery = useTagsByUser(userId, { pageSize: 500 });
  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateAdvancedOpen, setIsCreateAdvancedOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [successVariant, setSuccessVariant] = useState<
    "create" | "duplicate" | null
  >(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isDuplicateMode, setIsDuplicateMode] = useState(false);
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
  const [deleteTargetIds, setDeleteTargetIds] = useState<number[]>([]);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewTransaction, setViewTransaction] = useState<Transaction | null>(
    null
  );

  const [filterTypeDraft, setFilterTypeDraft] = useState<string>("all");
  const [filterSourceDraft, setFilterSourceDraft] = useState<string>("all");
  const [filterCategoryIdsDraft, setFilterCategoryIdsDraft] = useState<
    string[]
  >([]);
  const [filterSubcategoryIdsDraft, setFilterSubcategoryIdsDraft] = useState<
    string[]
  >([]);
  const [filterTagIdsDraft, setFilterTagIdsDraft] = useState<string[]>([]);
  const [filterDateRangeDraft, setFilterDateRangeDraft] =
    useState<DateRangeFilter>({
      start: "",
      end: "",
    });
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterCategoryIds, setFilterCategoryIds] = useState<string[]>([]);
  const [filterSubcategoryIds, setFilterSubcategoryIds] = useState<string[]>([]);
  const [filterTagIds, setFilterTagIds] = useState<string[]>([]);
  const [filterDateRange, setFilterDateRange] = useState<DateRangeFilter>({
    start: "",
    end: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFormKey, setFilterFormKey] = useState(0);
  const [filterCategoryKey, setFilterCategoryKey] = useState(0);
  const [filterSubcategoryKey, setFilterSubcategoryKey] = useState(0);
  const filterCategoryIdsParam = useMemo(
    () => (filterCategoryIds.length ? filterCategoryIds.join(",") : undefined),
    [filterCategoryIds]
  );
  const filterSubcategoryIdsParam = useMemo(
    () =>
      filterSubcategoryIds.length
        ? filterSubcategoryIds.join(",")
        : undefined,
    [filterSubcategoryIds]
  );
  const filterTagIdsParam = useMemo(
    () => (filterTagIds.length ? filterTagIds.join(",") : undefined),
    [filterTagIds]
  );
  const filterTypeParam = filterType !== "all" ? filterType : undefined;
  const filterSourceParam =
    filterSource !== "all" ? filterSource : undefined;
  const filterStartDate = filterDateRange.start || undefined;
  const filterEndDate = filterDateRange.end || undefined;
  const hasOwnershipIds = Boolean(accountIdsParam || creditCardIdsParam);
  const handleTransactionsSuccess = useCallback(
    (data: ApiListResponse<Transaction>) => {
      const resolvedPageSize = data.pageSize ?? pageSize;
      if (!resolvedPageSize) {
        return;
      }
      const totalPageCount =
        data.pageCount ??
        (data.totalItems !== undefined
          ? Math.ceil(data.totalItems / resolvedPageSize)
          : undefined);
      if (totalPageCount === undefined) {
        return;
      }
      const normalizedPageCount = Math.max(totalPageCount, 1);
      const nextPage = Math.min(
        Math.max(currentPage, 1),
        normalizedPageCount
      );
      if (nextPage !== currentPage) {
        setCurrentPage(nextPage);
      }
    },
    [currentPage, pageSize]
  );
  const transactionsQuery = useTransactions(
    {
      sort: serverSortKey,
      order: serverSortDirection,
      page: currentPage,
      pageSize,
      limit: pageSize,
      accountIds: accountIdsParam,
      creditCardIds: creditCardIdsParam,
      transactionType: filterTypeParam,
      transactionSource: filterSourceParam,
      categoryIds: filterCategoryIdsParam,
      subcategoryIds: filterSubcategoryIdsParam,
      tagIds: filterTagIdsParam,
      startDate: filterStartDate,
      endDate: filterEndDate,
    },
    {
      enabled:
        Boolean(userId) &&
        accountsQuery.isSuccess &&
        cardsQuery.isSuccess &&
        hasOwnershipIds,
      onSuccess: handleTransactionsSuccess,
    }
  );
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<
    number[]
  >([]);
  const filterDateRangeDefault = useMemo(() => {
    if (filterDateRangeDraft.start && filterDateRangeDraft.end) {
      return [
        new Date(filterDateRangeDraft.start),
        new Date(filterDateRangeDraft.end),
      ];
    }
    if (filterDateRangeDraft.start) {
      return [new Date(filterDateRangeDraft.start)];
    }
    if (filterDateRangeDraft.end) {
      return [new Date(filterDateRangeDraft.end)];
    }
    return undefined;
  }, [filterDateRangeDraft]);

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
  const pageSizeOptions = useMemo(
    () =>
      [10, 25, 50, 100].map((size) => ({
        value: String(size),
        label: String(size),
      })),
    []
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

  const accountOptions = useMemo(
    () =>
      accounts
        .map((account) => ({
          value: String(account.id),
          label:
            account.name ||
            t("resource.accounts.fallbacks.accountWithId", { id: account.id }),
        }))
        .sort((left, right) =>
          left.label.localeCompare(right.label, locale, { sensitivity: "base" })
        ),
    [accounts, locale, t]
  );

  const cardOptions = useMemo(
    () =>
      cards
        .map((card) => ({
          value: String(card.id),
          label:
            card.name ||
            t("resource.creditCards.fallbacks.cardWithId", { id: card.id }),
        }))
        .sort((left, right) =>
          left.label.localeCompare(right.label, locale, { sensitivity: "base" })
        ),
    [cards, locale, t]
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
        }))
        .sort((left, right) =>
          left.label.localeCompare(right.label, locale, { sensitivity: "base" })
        ),
    [categories, locale, transactionType, t]
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
        }))
        .sort((left, right) =>
          left.label.localeCompare(right.label, locale, { sensitivity: "base" })
        ),
    [categories, editTransactionType, locale, t]
  );

  const filterCategoryOptions = useMemo(() => {
    const filtered =
      filterTypeDraft === "all"
        ? categories
        : categories.filter((category) => category.type === filterTypeDraft);
    return filtered
      .map((category) => ({
        value: String(category.id),
        text:
          category.name ||
          t("resource.categories.fallbacks.categoryWithId", {
            id: category.id,
          }),
        selected: false,
      }))
      .sort((left, right) =>
        left.text.localeCompare(right.text, locale, { sensitivity: "base" })
      );
  }, [categories, filterTypeDraft, locale, t]);

  const filterSubcategoryOptions = useMemo(() => {
    const categoriesByType =
      filterTypeDraft === "all"
        ? categories
        : categories.filter((category) => category.type === filterTypeDraft);
    const allowedCategoryIds = new Set(categoriesByType.map((category) => category.id));
    const selectedCategoryIds = filterCategoryIdsDraft.length
      ? new Set(
          filterCategoryIdsDraft
            .map((id) => Number(id))
            .filter((id) => allowedCategoryIds.has(id))
      )
      : allowedCategoryIds;
    return subcategories
      .filter((subcategory) => selectedCategoryIds.has(subcategory.categoryId))
      .map((subcategory) => ({
        value: String(subcategory.id),
        text:
          subcategory.name ||
          t("resource.transactions.fallbacks.subcategoryWithId", {
            id: subcategory.id,
          }),
        selected: false,
      }))
      .sort((left, right) =>
        left.text.localeCompare(right.text, locale, { sensitivity: "base" })
      );
  }, [categories, filterCategoryIdsDraft, filterTypeDraft, locale, subcategories, t]);

  const normalizeCategorySelection = useCallback(
    (nextType: string, selectedIds: string[]) => {
      if (nextType === "all") {
        return selectedIds;
      }
      const allowed = new Set(
        categories
          .filter((category) => category.type === nextType)
          .map((category) => String(category.id))
      );
      return selectedIds.filter((id) => allowed.has(id));
    },
    [categories]
  );

  const normalizeSubcategorySelection = useCallback(
    (nextType: string, selectedCategoryIds: string[], selectedSubcategoryIds: string[]) => {
      if (!selectedSubcategoryIds.length) {
        return selectedSubcategoryIds;
      }
      const categoriesByType =
        nextType === "all"
          ? categories
          : categories.filter((category) => category.type === nextType);
      const allowedCategories = new Set(
        categoriesByType.map((category) => category.id)
      );
      const allowedCategoryIds = selectedCategoryIds.length
        ? new Set(
            selectedCategoryIds
              .map((id) => Number(id))
              .filter((id) => allowedCategories.has(id))
          )
        : allowedCategories;
      const allowedSubcategoryIds = new Set(
        subcategories
          .filter((subcategory) => allowedCategoryIds.has(subcategory.categoryId))
          .map((subcategory) => String(subcategory.id))
      );
      return selectedSubcategoryIds.filter((id) => allowedSubcategoryIds.has(id));
    },
    [categories, subcategories]
  );

  const handleFilterTypeChange = (value: string) => {
    setFilterTypeDraft(value);
    const nextCategoryIds = normalizeCategorySelection(
      value,
      filterCategoryIdsDraft
    );
    if (nextCategoryIds.length !== filterCategoryIdsDraft.length) {
      setFilterCategoryIdsDraft(nextCategoryIds);
      setFilterCategoryKey((prev) => prev + 1);
    }
    const nextSubcategoryIds = normalizeSubcategorySelection(
      value,
      nextCategoryIds,
      filterSubcategoryIdsDraft
    );
    if (nextSubcategoryIds.length !== filterSubcategoryIdsDraft.length) {
      setFilterSubcategoryIdsDraft(nextSubcategoryIds);
      setFilterSubcategoryKey((prev) => prev + 1);
    }
  };

  const handleFilterCategoryChange = (selectedIds: string[]) => {
    setFilterCategoryIdsDraft(selectedIds);
    const nextSubcategoryIds = normalizeSubcategorySelection(
      filterTypeDraft,
      selectedIds,
      filterSubcategoryIdsDraft
    );
    if (nextSubcategoryIds.length !== filterSubcategoryIdsDraft.length) {
      setFilterSubcategoryIdsDraft(nextSubcategoryIds);
      setFilterSubcategoryKey((prev) => prev + 1);
    }
  };

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
      }))
      .sort((left, right) =>
        left.label.localeCompare(right.label, locale, { sensitivity: "base" })
      );
  }, [categoryId, locale, subcategories, t]);

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
      }))
      .sort((left, right) =>
        left.label.localeCompare(right.label, locale, { sensitivity: "base" })
      );
  }, [editCategoryId, locale, subcategories, t]);

  const tagOptions = useMemo(
    () =>
      tags
        .map((tag) => ({
          value: String(tag.id),
          text:
            tag.name || t("resource.tags.fallbacks.tagWithId", { id: tag.id }),
          selected: false,
        }))
        .sort((left, right) =>
          left.text.localeCompare(right.text, locale, { sensitivity: "base" })
        ),
    [tags, locale, t]
  );

  const tagFilterOptions = useMemo(
    () =>
      tags
        .map((tag) => ({
          value: String(tag.id),
          text:
            tag.name || t("resource.tags.fallbacks.tagWithId", { id: tag.id }),
          selected: false,
        }))
        .sort((left, right) =>
          left.text.localeCompare(right.text, locale, { sensitivity: "base" })
        ),
    [tags, locale, t]
  );

  const accountMap = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.name])),
    [accounts]
  );
  const cardMap = useMemo(
    () => new Map(cards.map((card) => [card.id, card.name])),
    [cards]
  );
  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories]
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

  const resolveCategoryId = useCallback((transaction: Transaction) => {
    const directId = normalizeId(transaction.categoryId);
    if (directId !== null) {
      return directId;
    }
    const subcategoryId = normalizeId(transaction.subcategoryId);
    if (subcategoryId === null) {
      return null;
    }
    return subcategoryById.get(subcategoryId)?.categoryId ?? null;
  }, [subcategoryById]);

  const resolveCategoryLabel = useCallback((transaction: Transaction) => {
    const categoryId = resolveCategoryId(transaction);
    if (!categoryId) {
      return t("resource.common.placeholders.emptyValue");
    }
    return (
      categoryMap.get(categoryId) ||
      t("resource.categories.fallbacks.categoryWithId", { id: categoryId })
    );
  }, [categoryMap, resolveCategoryId, t]);

  const resolveCategoryColor = useCallback((
    transaction: Transaction
  ): CategoryColor | "light" => {
    const categoryId = resolveCategoryId(transaction);
    if (!categoryId) {
      return "light";
    }
    return categoryById.get(categoryId)?.color ?? "light";
  }, [categoryById, resolveCategoryId]);

  const resolveSubcategoryLabel = useCallback((transaction: Transaction) => {
    const subcategoryId = normalizeId(transaction.subcategoryId);
    if (subcategoryId === null) {
      return null;
    }
    const subcategory = subcategoryById.get(subcategoryId);
    return (
      subcategory?.name ||
      t("resource.transactions.fallbacks.subcategoryWithId", {
        id: subcategoryId,
      })
    );
  }, [subcategoryById, t]);

  const resolveSourceLabel = useCallback((transaction: Transaction) => {
    if (transaction.transactionSource === "account") {
      const accountId = normalizeId(transaction.accountId);
      return (
        accountMap.get(accountId ?? -1) ||
        t("resource.accounts.fallbacks.accountWithId", {
          id: accountId ?? "-",
        })
      );
    }
    const cardId = normalizeId(transaction.creditCardId);
    return (
      cardMap.get(cardId ?? -1) ||
      t("resource.creditCards.fallbacks.cardWithId", {
        id: cardId ?? "-",
      })
    );
  }, [accountMap, cardMap, t]);

  const resolveTagLabels = useCallback((transaction: Transaction) => {
    const tagIds = transaction.tags ?? [];
    if (!tagIds.length) {
      return t("resource.common.placeholders.emptyDash");
    }
    return tagIds
      .map((tagId) =>
        tagMap.get(normalizeId(tagId) ?? -1) ||
        t("resource.tags.fallbacks.tagWithId", { id: tagId })
      )
      .join(", ");
  }, [tagMap, t]);

  const renderCategoryBadges = (transaction: Transaction) => {
    const categoryId = resolveCategoryId(transaction);
    if (!categoryId) {
      return (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {t("resource.common.placeholders.emptyValue")}
        </span>
      );
    }
    const subcategoryLabel = resolveSubcategoryLabel(transaction);
    const categoryColor = resolveCategoryColor(transaction);

    return (
      <div className="flex flex-wrap gap-2">
        {subcategoryLabel ? (
          <Badge variant="light" color={categoryColor} size="sm">
            {subcategoryLabel}
          </Badge>
        ) : (
          <Badge variant="solid" color={categoryColor} size="sm">
            {resolveCategoryLabel(transaction)}
          </Badge>
        )}
      </div>
    );
  };

  const renderTagBadges = (transaction: Transaction) => {
    const tagIds = transaction.tags ?? [];
    if (!tagIds.length) {
      return (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {t("resource.common.placeholders.emptyDash")}
        </span>
      );
    }
    return (
      <div className="flex flex-wrap gap-1.5">
        {tagIds.map((tagId) => (
          <Badge key={tagId} variant="light" color="light" size="sm">
            {tagMap.get(normalizeId(tagId) ?? -1) ??
              t("resource.tags.fallbacks.tagWithId", { id: tagId })}
          </Badge>
        ))}
      </div>
    );
  };

  const transactions = useMemo(
    () => transactionsQuery.data?.data ?? [],
    [transactionsQuery.data]
  );

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    const searchTerm = normalizeSearchText(searchQuery);
    if (searchTerm) {
      filtered = filtered.filter((transaction) => {
        const formattedDate = formatDateForPreference(
          transaction.date,
          preferredDateFormat
        );
        const isoDate = toDateInputValue(transaction.date);
        const searchable = [
          typeLabels.get(transaction.transactionType) ??
            transaction.transactionType,
          sourceLabels.get(transaction.transactionSource) ??
            transaction.transactionSource,
          resolveSourceLabel(transaction),
          resolveCategoryLabel(transaction),
          resolveSubcategoryLabel(transaction) ?? "",
          resolveTagLabels(transaction),
          formattedDate,
          isoDate,
          transaction.date,
          transaction.observation ?? "",
          String(transaction.value ?? ""),
        ]
          .join(" ")
          .toLowerCase();
        return searchable.includes(searchTerm);
      });
    }

    return filtered;
  }, [
    transactions,
    searchQuery,
    resolveCategoryLabel,
    resolveSourceLabel,
    resolveSubcategoryLabel,
    resolveTagLabels,
    sourceLabels,
    typeLabels,
    preferredDateFormat,
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

  const transactionById = useMemo(
    () => new Map(sortedTransactions.map((transaction) => [transaction.id, transaction])),
    [sortedTransactions]
  );
  const resolvedSelectedTransactionIds = useMemo(
    () => selectedTransactionIds.filter((id) => transactionById.has(id)),
    [selectedTransactionIds, transactionById]
  );
  const selectedIdSet = useMemo(
    () => new Set(resolvedSelectedTransactionIds),
    [resolvedSelectedTransactionIds]
  );
  const isBulkMode = resolvedSelectedTransactionIds.length > 0;
  const allVisibleSelected =
    sortedTransactions.length > 0 &&
    sortedTransactions.every((transaction) =>
      selectedIdSet.has(transaction.id)
    );

  const totalPages = useMemo(() => {
    const pageCount = transactionsQuery.data?.pageCount;
    if (pageCount) {
      return Math.max(pageCount, 1);
    }
    const totalItems = transactionsQuery.data?.totalItems;
    if (totalItems) {
      return Math.max(Math.ceil(totalItems / pageSize), 1);
    }
    return 1;
  }, [transactionsQuery.data?.pageCount, transactionsQuery.data?.totalItems, pageSize]);
  const totalResults = searchQuery
    ? filteredTransactions.length
    : transactionsQuery.data?.totalItems ?? sortedTransactions.length;
  const isTransactionsLoading =
    transactionsQuery.isLoading ||
    accountsQuery.isLoading ||
    cardsQuery.isLoading;

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

  const handleApplyFilters = () => {
    const nextCategoryIds = normalizeCategorySelection(
      filterTypeDraft,
      filterCategoryIdsDraft
    );
    const nextSubcategoryIds = normalizeSubcategorySelection(
      filterTypeDraft,
      nextCategoryIds,
      filterSubcategoryIdsDraft
    );
    setFilterType(filterTypeDraft);
    setFilterSource(filterSourceDraft);
    setFilterCategoryIds(nextCategoryIds);
    setFilterSubcategoryIds(nextSubcategoryIds);
    setFilterTagIds(filterTagIdsDraft);
    setFilterDateRange(filterDateRangeDraft);
    setCurrentPage(1);
    setSelectedTransactionIds([]);
  };

  const handleClearFilters = () => {
    setFilterTypeDraft("all");
    setFilterSourceDraft("all");
    setFilterCategoryIdsDraft([]);
    setFilterSubcategoryIdsDraft([]);
    setFilterTagIdsDraft([]);
    setFilterDateRangeDraft({ start: "", end: "" });
    setFilterType("all");
    setFilterSource("all");
    setFilterCategoryIds([]);
    setFilterSubcategoryIds([]);
    setFilterTagIds([]);
    setFilterDateRange({ start: "", end: "" });
    setSearchQuery("");
    setCurrentPage(1);
    setFilterFormKey((prev) => prev + 1);
    setFilterCategoryKey((prev) => prev + 1);
    setFilterSubcategoryKey((prev) => prev + 1);
    setSelectedTransactionIds([]);
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

  const closeSuccessModal = () => {
    setIsSuccessOpen(false);
    setSuccessVariant(null);
  };

  const openCreateModal = (type: TransactionType) => {
    resetForm(type);
    setFormError(null);
    setSuccessVariant(null);
    setIsSuccessOpen(false);
    setIsDuplicateMode(false);
    setIsCreateAdvancedOpen(false);
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setIsDuplicateMode(false);
  };

  const openDuplicateModal = (transaction: Transaction) => {
    const directCategoryId = normalizeId(transaction.categoryId);
    const subcategoryId = normalizeId(transaction.subcategoryId);
    const fallbackCategoryId =
      directCategoryId ??
      (subcategoryId !== null
        ? subcategoryById.get(subcategoryId)?.categoryId ?? null
        : null);
    const numericValue = Number(transaction.value);
    setFormError(null);
    setSuccessVariant(null);
    setIsSuccessOpen(false);
    setIsDuplicateMode(true);
    setValue(Number.isNaN(numericValue) ? "" : formatAmountValue(numericValue, locale));
    setDate(toDateInputValue(transaction.date));
    setCategoryId(fallbackCategoryId ? String(fallbackCategoryId) : "");
    setSubcategoryId(
      transaction.subcategoryId ? String(transaction.subcategoryId) : ""
    );
    setTransactionType(transaction.transactionType);
    setTransactionSource(transaction.transactionSource);
    setAccountId(transaction.accountId ? String(transaction.accountId) : "");
    setCardId(transaction.creditCardId ? String(transaction.creditCardId) : "");
    setIsInstallment(transaction.isInstallment);
    setTotalMonths(transaction.totalMonths ? String(transaction.totalMonths) : "");
    setIsRecurring(transaction.isRecurring);
    setPaymentDay(transaction.paymentDay ? String(transaction.paymentDay) : "");
    setTagIds((transaction.tags ?? []).map(String));
    setObservation(transaction.observation || "");
    setFormKey((prev) => prev + 1);
    setIsCreateAdvancedOpen(
      transaction.isInstallment ||
        transaction.isRecurring ||
        Boolean(transaction.observation) ||
        (transaction.tags ?? []).length > 0
    );
    setIsCreateOpen(true);
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
      const wasDuplicate = isDuplicateMode;
      const parsedAmount = parseAmountInput(value);
      if (parsedAmount === null) {
        setFormError(t("resource.transactions.validation.amountPositive"));
        return;
      }
      await createTransactionMutation.mutateAsync({
        value: parsedAmount,
        date,
        categoryId: Number(categoryId),
        subcategoryId: subcategoryId ? Number(subcategoryId) : undefined,
        transactionType,
        transactionSource,
        accountId:
          transactionSource === "account" ? Number(accountId) : undefined,
        creditCardId:
          transactionSource === "creditCard" ? Number(cardId) : undefined,
        isInstallment,
        totalMonths: isInstallment ? Number(totalMonths) : undefined,
        isRecurring,
        paymentDay: isRecurring ? Number(paymentDay) : undefined,
        tags: tagIds.length ? tagIds.map((id) => Number(id)) : undefined,
        observation: observation.trim() || undefined,
      });
      setIsCreateOpen(false);
      setIsDuplicateMode(false);
      setSuccessVariant(wasDuplicate ? "duplicate" : "create");
      setIsSuccessOpen(true);
      resetForm(transactionType);
    } catch (error) {
      setFormError(getApiErrorMessage(error, t("resource.common.errors.generic")));
    }
  };

  const openEditModal = (transaction: (typeof filteredTransactions)[number]) => {
    const directCategoryId = normalizeId(transaction.categoryId);
    const subcategoryId = normalizeId(transaction.subcategoryId);
    const fallbackCategoryId =
      directCategoryId ??
      (subcategoryId !== null
        ? subcategoryById.get(subcategoryId)?.categoryId ?? null
        : null);
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
    setIsEditAdvancedOpen(
      transaction.isInstallment ||
        transaction.isRecurring ||
        Boolean(transaction.observation) ||
        (transaction.tags ?? []).length > 0
    );
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
          categoryId: Number(editCategoryId),
          subcategoryId: editSubcategoryId
            ? Number(editSubcategoryId)
            : undefined,
          transactionType: editTransactionType,
          transactionSource: editTransactionSource,
          accountId:
            editTransactionSource === "account"
              ? Number(editAccountId)
              : undefined,
          creditCardId:
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

  const openDeleteModal = (ids: number | number[]) => {
    const nextIds = Array.isArray(ids) ? ids : [ids];
    setDeleteTargetIds(nextIds);
    setIsDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
    setDeleteTargetIds([]);
  };

  const handleDelete = async () => {
    if (!deleteTargetIds.length) {
      return;
    }
    try {
      for (const id of deleteTargetIds) {
        await deleteTransactionMutation.mutateAsync(id);
      }
      closeDeleteModal();
      setSelectedTransactionIds([]);
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
    const categoryId = normalizeId(transaction.categoryId);
    const subcategoryId = normalizeId(transaction.subcategoryId);
    if (categoryId === null && subcategoryId === null) {
      return;
    }
    try {
      await updateTransactionMutation.mutateAsync({
        id: transaction.id,
        payload: {
          active: false,
          categoryId: categoryId ?? undefined,
          subcategoryId: subcategoryId ?? undefined,
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
    setCurrentPage(1);
    setSelectedTransactionIds([]);
    const isSameKey = sortKey === key;
    setSortKey(key);
    if (isSameKey) {
      setSortDirection((currentDirection) =>
        currentDirection === "asc" ? "desc" : "asc"
      );
      return;
    }
    setSortDirection(key === "date" ? "desc" : "asc");
  };

  const handlePageChange = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(nextPage);
    setSelectedTransactionIds([]);
  };

  const handlePageSizeChange = (value: string) => {
    const nextSize = Number(value);
    if (Number.isNaN(nextSize) || nextSize <= 0) {
      return;
    }
    setPageSize(nextSize);
    setCurrentPage(1);
    setSelectedTransactionIds([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactionIds(sortedTransactions.map((transaction) => transaction.id));
      return;
    }
    setSelectedTransactionIds([]);
  };

  const handleSelectTransaction = (id: number, checked: boolean) => {
    setSelectedTransactionIds((prev) => {
      if (checked) {
        return prev.includes(id) ? prev : [...prev, id];
      }
      return prev.filter((selectedId) => selectedId !== id);
    });
  };

  const handleBulkArchive = async () => {
    if (!resolvedSelectedTransactionIds.length) {
      return;
    }
    const targets = resolvedSelectedTransactionIds
      .map((id) => transactionById.get(id))
      .filter((transaction): transaction is Transaction => Boolean(transaction));

    for (const transaction of targets) {
      if (!transaction.active) {
        continue;
      }
      const categoryId = normalizeId(transaction.categoryId);
      const subcategoryId = normalizeId(transaction.subcategoryId);
      if (categoryId === null && subcategoryId === null) {
        continue;
      }
      try {
          await updateTransactionMutation.mutateAsync({
            id: transaction.id,
            payload: {
              active: false,
              categoryId: categoryId ?? undefined,
              subcategoryId: subcategoryId ?? undefined,
            },
          });
      } catch {
        // Error handled by mutation state.
      }
    }
    setSelectedTransactionIds([]);
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
          <div onClick={(event) => event.stopPropagation()}>
            <Checkbox
              checked={allVisibleSelected}
              onChange={handleSelectAll}
              ariaLabel={t("resource.transactions.bulk.selectAll")}
              disabled={sortedTransactions.length === 0}
            />
          </div>
        </TableCell>
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

  const createModalTitle = isDuplicateMode
    ? transactionType === "expense"
      ? t("resource.transactions.actions.duplicateExpense")
      : t("resource.transactions.actions.duplicateIncome")
    : transactionType === "expense"
    ? t("resource.transactions.actions.addExpense")
    : t("resource.transactions.actions.addIncome");
  const createModalSubmitLabel = isDuplicateMode
    ? t("resource.transactions.duplicate.actions.submit")
    : t("resource.transactions.create.actions.submit");
  const successTitle =
    successVariant === "duplicate"
      ? t("resource.transactions.duplicate.successTitle")
      : t("resource.transactions.create.successTitle");
  const successMessage =
    successVariant === "duplicate"
      ? t("resource.transactions.duplicate.successMessage")
      : t("resource.transactions.create.successMessage");
  const deleteTitle =
    deleteTargetIds.length > 1
      ? t("resource.transactions.delete.bulkTitle")
      : t("resource.transactions.delete.title");
  const deleteSubtitle =
    deleteTargetIds.length > 1
      ? t("resource.transactions.delete.bulkWarningTitle")
      : t("resource.transactions.delete.warningTitle");
  const deleteMessage =
    deleteTargetIds.length > 1
      ? t("resource.transactions.delete.bulkWarningMessage", {
          count: deleteTargetIds.length,
        })
      : t("resource.transactions.delete.warningMessage");

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
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <Label>{t("resource.transactions.filters.type")}</Label>
                    <Select
                      key={`filter-type-${filterFormKey}`}
                      options={filterTypeOptions}
                      defaultValue={filterTypeDraft}
                      onChange={handleFilterTypeChange}
                      placeholder={t(
                        "resource.transactions.filters.placeholders.type"
                      )}
                    />
                </div>
                <div>
                  <Label>{t("resource.transactions.filters.source")}</Label>
                  <Select
                    key={`filter-source-${filterFormKey}`}
                    options={filterSourceOptions}
                    defaultValue={filterSourceDraft}
                    onChange={setFilterSourceDraft}
                    placeholder={t(
                      "resource.transactions.filters.placeholders.source"
                    )}
                  />
                </div>
                <MultiSelect
                  key={`filter-category-${filterCategoryKey}`}
                  label={t("resource.transactions.filters.category")}
                  options={filterCategoryOptions}
                  defaultSelected={filterCategoryIdsDraft}
                  onChange={handleFilterCategoryChange}
                />
                <MultiSelect
                  key={`filter-subcategory-${filterSubcategoryKey}`}
                  label={t("resource.transactions.filters.subcategory")}
                  options={filterSubcategoryOptions}
                  defaultSelected={filterSubcategoryIdsDraft}
                  onChange={setFilterSubcategoryIdsDraft}
                />
                <MultiSelect
                  key={`filter-tag-${filterFormKey}`}
                  label={t("resource.transactions.filters.tag")}
                  options={tagFilterOptions}
                  defaultSelected={filterTagIdsDraft}
                  onChange={setFilterTagIdsDraft}
                />
                <div>
                  <DatePicker
                    key={`filter-date-${filterFormKey}`}
                    id={`transactions-date-range-${filterFormKey}`}
                    mode="range"
                    label={t("resource.transactions.filters.dateRange")}
                    placeholder={t(
                      "resource.transactions.placeholders.dateRange"
                    )}
                    dateFormat={datePickerFormat}
                    iconPosition="left"
                    staticPosition={false}
                    appendTo={datePickerPortal}
                    defaultDate={filterDateRangeDefault}
                    onChange={(dates) => {
                      const [start, end] = dates;
                      setFilterDateRangeDraft({
                        start: start ? toDateInputValue(start) : "",
                        end: end ? toDateInputValue(end) : "",
                      });
                    }}
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={handleClearFilters}
                >
                  {t("resource.transactions.filters.actions.clear")}
                </Button>
                <Button size="sm" type="button" onClick={handleApplyFilters}>
                  {t("resource.transactions.filters.actions.apply")}
                </Button>
              </div>
            </div>
            {isBulkMode && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-100 p-3 dark:border-white/[0.05]">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t("resource.transactions.bulk.selectedCount", {
                    count: resolvedSelectedTransactionIds.length,
                  })}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    disabled={updateTransactionMutation.isPending}
                    onClick={handleBulkArchive}
                  >
                    {t("resource.transactions.bulk.archive")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    disabled={deleteTransactionMutation.isPending}
                    onClick={() => openDeleteModal(resolvedSelectedTransactionIds)}
                  >
                    {t("resource.transactions.bulk.delete")}
                  </Button>
                </div>
              </div>
            )}
            <div className="mb-4 flex flex-wrap items-end gap-3">
              <div className="min-w-[200px]">
                <Label>{t("resource.transactions.pagination.itemsPerPage")}</Label>
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
              <div className="w-full max-w-[420px] sm:ml-auto">
                <Label>{t("resource.transactions.filters.search")}</Label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={t(
                      "resource.transactions.filters.placeholders.search"
                    )}
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setCurrentPage(1);
                      setSelectedTransactionIds([]);
                    }}
                    className="pl-10"
                  />
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <MagnifyingGlass size={18} />
                  </span>
                </div>
              </div>
            </div>
            {isTransactionsLoading ? (
              <div className="overflow-x-auto">
                <div className="min-w-[980px]">
                  <Table>
                    {tableHeader}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <TableRow key={`skeleton-${index}`} className="animate-pulse">
                          <TableCell className="px-5 py-4">
                            <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-800" />
                          </TableCell>
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
              <>
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
                          <TableCell className="px-5 py-4">
                            <div
                              onClick={(event) => event.stopPropagation()}
                              onKeyDown={(event) => event.stopPropagation()}
                            >
                              <Checkbox
                                checked={selectedIdSet.has(transaction.id)}
                                onChange={(checked) =>
                                  handleSelectTransaction(transaction.id, checked)
                                }
                                ariaLabel={t("resource.transactions.bulk.selectRow", {
                                  id: transaction.id,
                                })}
                              />
                            </div>
                          </TableCell>
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
                            {renderCategoryBadges(transaction)}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {renderTagBadges(transaction)}
                          </TableCell>
                            <TableCell
                                    className={`px-5 py-4 text-sm`}>
                                {/* //  ${transaction.transactionType === "income"
                                //   ? "text-cyan-600 dark:text-success-400"
                                //   : "text-orange-600 dark:text-error-400"}`
                                //     } */}

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
                                disabled={isBulkMode}
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
                                title={t(
                                  "resource.transactions.actions.duplicate"
                                )}
                                ariaLabel={t(
                                  "resource.transactions.actions.duplicate"
                                )}
                                disabled={isBulkMode}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openDuplicateModal(transaction);
                                }}
                              >
                                <Copy size={16} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="!h-9 !w-9 !px-0 !py-0"
                                title={t(
                                  "resource.transactions.actions.archive"
                                )}
                                ariaLabel={t(
                                  "resource.transactions.actions.archive"
                                )}
                                disabled={
                                  isBulkMode ||
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
                                disabled={
                                  isBulkMode ||
                                  deleteTransactionMutation.isPending
                                }
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
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    {t("resource.transactions.list.totalResults", {
                      count: totalResults,
                    })}
                  </span>
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              </>
            )}
          </>
        )}
      </ComponentCard>

      <TransactionModal
        isOpen={isCreateOpen}
        title={createModalTitle}
        submitLabel={createModalSubmitLabel}
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
                  {resolveSubcategoryLabel(viewTransaction) ??
                    t("resource.common.placeholders.emptyValue")}
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

      <Modal
        isOpen={isSuccessOpen && Boolean(successVariant)}
        onClose={closeSuccessModal}
        className="m-4 w-full max-w-[520px]"
      >
        <div className="p-6 space-y-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <CheckCircle size={56} weight="fill" className="text-success-500" />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {successTitle}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {successMessage}
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
        isOpen={isDeleteOpen}
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
