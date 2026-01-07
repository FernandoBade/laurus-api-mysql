"use client";

import React, { useMemo, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
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
import { useTagsByUser } from "@/features/tags/hooks";
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from "@/features/transactions/hooks";
import type { TransactionSource, TransactionType } from "@/shared/types/domain";
import { getApiErrorMessage } from "@/shared/lib/api/errors";
import {
  formatDate,
  formatMoney,
  toDateInputValue,
} from "@/shared/lib/formatters";
import { EmptyState, ErrorState, LoadingState } from "@/shared/ui";
import { useTranslation } from "react-i18next";


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
  const transactionsQuery = useTransactions({ sort: "date", order: "desc" });
  const accountsQuery = useAccountsByUser(userId);
  const cardsQuery = useCreditCardsByUser(userId);
  const categoriesQuery = useCategoriesByUser(userId);
  const tagsQuery = useTagsByUser(userId);
  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();

  const [formKey, setFormKey] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [date, setDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
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
  const [active, setActive] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editKey, setEditKey] = useState(0);
  const [editError, setEditError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
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
  const [editActive, setEditActive] = useState(true);

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

  const accounts = useMemo(
    () => accountsQuery.data?.data ?? [],
    [accountsQuery.data]
  );
  const cards = useMemo(() => cardsQuery.data?.data ?? [], [cardsQuery.data]);
  const categories = useMemo(
    () => categoriesQuery.data?.data ?? [],
    [categoriesQuery.data]
  );
  const tags = useMemo(() => tagsQuery.data?.data ?? [], [tagsQuery.data]);

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
      categories.map((category) => ({
        value: String(category.id),
        label:
          category.name ||
          t("resource.categories.fallbacks.categoryWithId", {
            id: category.id,
          }),
      })),
    [categories, t]
  );

  const tagOptions = useMemo(
    () =>
      tags.map((tag) => ({
        value: String(tag.id),
        text:
          tag.name ||
          t("resource.tags.fallbacks.tagWithId", { id: tag.id }),
        selected: false,
      })),
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

  const filteredTransactions = useMemo(() => {
    const transactions = transactionsQuery.data?.data ?? [];
    if (!accounts.length && !cards.length) {
      return transactions;
    }
    const accountIds = new Set(accounts.map((account) => account.id));
    const cardIds = new Set(cards.map((card) => card.id));
    return transactions.filter(
      (transaction) =>
        (transaction.accountId && accountIds.has(transaction.accountId)) ||
        (transaction.creditCardId && cardIds.has(transaction.creditCardId))
    );
  }, [transactionsQuery.data, accounts, cards]);

  const resetForm = () => {
    setValue("");
    setDate("");
    setCategoryId("");
    setTransactionType("expense");
    setTransactionSource("account");
    setAccountId("");
    setCardId("");
    setIsInstallment(false);
    setTotalMonths("");
    setIsRecurring(false);
    setPaymentDay("");
    setTagIds([]);
    setObservation("");
    setActive(true);
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
    const trimmedAmount = amount.trim();
    const numericAmount = Number(trimmedAmount);
    if (!trimmedAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
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
    if (installment && !months) {
      return t("resource.transactions.validation.installmentMonthsRequired");
    }
    if (recurring && !paymentValue) {
      return t("resource.transactions.validation.paymentDayRequired");
    }
    if (installment && recurring) {
      return t("resource.transactions.validation.invalidInstallmentRecurring");
    }
    if (paymentValue) {
      const payment = Number(paymentValue);
      if (Number.isNaN(payment) || payment < 1 || payment > 31) {
        return t("resource.transactions.validation.paymentDayRange");
      }
    }
    return null;
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
      const parsedAmount = Number(value.trim());
      await createTransactionMutation.mutateAsync({
        value: parsedAmount,
        date,
        category_id: Number(categoryId),
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
        active,
      });
      resetForm();
    } catch (error) {
      setFormError(getApiErrorMessage(error, t("resource.common.errors.generic")));
    }
  };

  const openEditModal = (transaction: (typeof filteredTransactions)[number]) => {
    setEditId(transaction.id);
    setEditValue(transaction.value ? String(transaction.value) : "");
    setEditDate(toDateInputValue(transaction.date));
    setEditCategoryId(transaction.categoryId ? String(transaction.categoryId) : "");
    setEditTransactionType(transaction.transactionType);
    setEditTransactionSource(transaction.transactionSource);
    setEditAccountId(transaction.accountId ? String(transaction.accountId) : "");
    setEditCardId(transaction.creditCardId ? String(transaction.creditCardId) : "");
    setEditIsInstallment(transaction.isInstallment);
    setEditTotalMonths(transaction.totalMonths ? String(transaction.totalMonths) : "");
    setEditIsRecurring(transaction.isRecurring);
    setEditPaymentDay(transaction.paymentDay ? String(transaction.paymentDay) : "");
    setEditTagIds([]);
    setEditObservation(transaction.observation || "");
    setEditActive(transaction.active);
    setEditError(null);
    setEditKey((prev) => prev + 1);
    setIsEditOpen(true);
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
      const parsedAmount = Number(editValue.trim());
      await updateTransactionMutation.mutateAsync({
        id: editId,
        payload: {
          value: parsedAmount,
          date: editDate,
          category_id: Number(editCategoryId),
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
      t("resource.transactions.confirmDelete")
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteTransactionMutation.mutateAsync(id);
    } catch {
      // Error handled by mutation state.
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {t("resource.transactions.title")}
        </h2>
      </div>

      <ComponentCard
        title={t("resource.transactions.create.title")}
        desc={t("resource.transactions.create.desc")}
      >
        <form onSubmit={handleCreate}>
          <div key={formKey} className="grid gap-5 lg:grid-cols-2">
            {formError && (
              <div className="lg:col-span-2">
                <Alert
                  variant="error"
                  title={t("resource.transactions.create.errors.notCreated")}
                  message={formError}
                />
              </div>
            )}
            <div>
              <Label>
                {t("resource.common.fields.value")}{" "}
                <span className="text-error-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder={t("resource.common.placeholders.amount")}
                name="value"
                onChange={(event) => setValue(event.target.value)}
              />
            </div>
            <div>
              <Label>
                {t("resource.common.fields.date")}{" "}
                <span className="text-error-500">*</span>
              </Label>
              <Input
                type="date"
                name="date"
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
            <div>
              <Label>
                {t("resource.common.fields.category")}{" "}
                <span className="text-error-500">*</span>
              </Label>
              <Select
                key={`create-category-${formKey}`}
                options={categoryOptions}
                placeholder={t("resource.transactions.placeholders.selectCategory")}
                onChange={setCategoryId}
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
                defaultValue={transactionType}
                onChange={(value) => setTransactionType(value as TransactionType)}
              />
            </div>
            <div>
              <Label>
                {t("resource.common.fields.source")}{" "}
                <span className="text-error-500">*</span>
              </Label>
              <Select
                key={`create-source-${formKey}`}
                options={sourceOptions}
                defaultValue={transactionSource}
                onChange={(value) =>
                  setTransactionSource(value as TransactionSource)
                }
              />
            </div>
            {transactionSource === "account" ? (
              <div>
                <Label>
                  {t("resource.common.fields.account")}{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <Select
                  key={`create-account-${formKey}`}
                  options={accountOptions}
                  placeholder={t("resource.transactions.placeholders.selectAccount")}
                  onChange={setAccountId}
                />
              </div>
            ) : (
              <div>
                <Label>
                  {t("resource.common.fields.creditCard")}{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <Select
                  key={`create-card-${formKey}`}
                  options={cardOptions}
                  placeholder={t("resource.transactions.placeholders.selectCard")}
                  onChange={setCardId}
                />
              </div>
            )}
            <div className="flex flex-col gap-4">
              <Checkbox
                checked={isInstallment}
                onChange={setIsInstallment}
                label={t("resource.transactions.fields.installment")}
              />
              <Checkbox
                checked={isRecurring}
                onChange={setIsRecurring}
                label={t("resource.transactions.fields.recurring")}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>{t("resource.transactions.fields.totalMonths")}</Label>
                <Input
                  type="number"
                  placeholder={t("resource.transactions.placeholders.totalMonths")}
                  name="totalMonths"
                  onChange={(event) => setTotalMonths(event.target.value)}
                />
              </div>
              <div>
                <Label>{t("resource.transactions.fields.paymentDay")}</Label>
                <Input
                  type="number"
                  placeholder={t("resource.transactions.placeholders.paymentDay")}
                  name="paymentDay"
                  onChange={(event) => setPaymentDay(event.target.value)}
                />
              </div>
            </div>
            <div className="lg:col-span-2">
              <MultiSelect
                label={t("resource.common.fields.tags")}
                options={tagOptions}
                defaultSelected={tagIds}
                onChange={setTagIds}
              />
            </div>
            <div className="lg:col-span-2">
              <Label>{t("resource.common.fields.observation")}</Label>
              <TextArea
                placeholder={t("resource.transactions.placeholders.observation")}
                value={observation}
                onChange={setObservation}
              />
            </div>
            <div className="lg:col-span-2 flex items-center justify-between">
              <Checkbox
                checked={active}
                onChange={setActive}
                label={t("resource.common.status.active")}
              />
              <Button
                className="min-w-[160px]"
                size="sm"
                disabled={createTransactionMutation.isPending}
              >
                {createTransactionMutation.isPending
                  ? t("resource.common.actions.saving")
                  : t("resource.transactions.create.actions.submit")}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>

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
        {!transactionsQuery.isError && transactionsQuery.isLoading && (
          <LoadingState message={t("resource.transactions.list.loading")} />
        )}
        {!transactionsQuery.isError && !transactionsQuery.isLoading && (
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      {t("resource.common.fields.date")}
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
                      {t("resource.common.fields.source")}
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      {t("resource.common.fields.category")}
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      {t("resource.common.fields.amount")}
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
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <EmptyState message={t("resource.transactions.list.empty")} />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => {
                      const sourceLabel =
                        transaction.transactionSource === "account"
                          ? accountMap.get(transaction.accountId ?? -1) ||
                            t("resource.accounts.fallbacks.accountWithId", {
                              id: transaction.accountId ?? "-",
                            })
                          : cardMap.get(transaction.creditCardId ?? -1) ||
                            t("resource.creditCards.fallbacks.cardWithId", {
                              id: transaction.creditCardId ?? "-",
                            });
                      const categoryLabel = transaction.categoryId
                        ? categoryMap.get(transaction.categoryId) ||
                          t("resource.categories.fallbacks.categoryWithId", {
                            id: transaction.categoryId,
                          })
                        : t("resource.common.placeholders.emptyValue");
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(transaction.date)}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {typeLabels.get(transaction.transactionType) ??
                              transaction.transactionType}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {sourceLabel}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {categoryLabel}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                            {formatMoney(transaction.value)}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {transaction.active
                              ? t("resource.common.status.active")
                              : t("resource.common.status.inactive")}
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditModal(transaction)}
                              >
                                {t("resource.common.actions.edit")}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={deleteTransactionMutation.isPending}
                                onClick={() => handleDelete(transaction.id)}
                              >
                                {t("resource.common.actions.delete")}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
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
            {t("resource.transactions.edit.title")}
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
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>
                    {t("resource.common.fields.value")}{" "}
                    <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder={t("resource.common.placeholders.amount")}
                    name="edit-value"
                    defaultValue={editValue}
                    onChange={(event) => setEditValue(event.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    {t("resource.common.fields.date")}{" "}
                    <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    name="edit-date"
                    defaultValue={editDate}
                    onChange={(event) => setEditDate(event.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    {t("resource.common.fields.category")}{" "}
                    <span className="text-error-500">*</span>
                  </Label>
                  <Select
                    key={`edit-category-${editKey}`}
                    options={categoryOptions}
                    defaultValue={editCategoryId}
                    onChange={setEditCategoryId}
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
                    defaultValue={editTransactionType}
                    onChange={(value) =>
                      setEditTransactionType(value as TransactionType)
                    }
                  />
                </div>
                <div>
                  <Label>
                    {t("resource.common.fields.source")}{" "}
                    <span className="text-error-500">*</span>
                  </Label>
                  <Select
                    key={`edit-source-${editKey}`}
                    options={sourceOptions}
                    defaultValue={editTransactionSource}
                    onChange={(value) =>
                      setEditTransactionSource(value as TransactionSource)
                    }
                  />
                </div>
                {editTransactionSource === "account" ? (
                  <div>
                    <Label>
                      {t("resource.common.fields.account")}{" "}
                      <span className="text-error-500">*</span>
                    </Label>
                    <Select
                      key={`edit-account-${editKey}`}
                      options={accountOptions}
                      defaultValue={editAccountId}
                      onChange={setEditAccountId}
                    />
                  </div>
                ) : (
                  <div>
                    <Label>
                      {t("resource.common.fields.creditCard")}{" "}
                      <span className="text-error-500">*</span>
                    </Label>
                    <Select
                      key={`edit-card-${editKey}`}
                      options={cardOptions}
                      defaultValue={editCardId}
                      onChange={setEditCardId}
                    />
                  </div>
                )}
                <div className="flex flex-col gap-4">
                  <Checkbox
                    checked={editIsInstallment}
                    onChange={setEditIsInstallment}
                    label={t("resource.transactions.fields.installment")}
                  />
                  <Checkbox
                    checked={editIsRecurring}
                    onChange={setEditIsRecurring}
                    label={t("resource.transactions.fields.recurring")}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>{t("resource.transactions.fields.totalMonths")}</Label>
                    <Input
                      type="number"
                      placeholder={t("resource.transactions.placeholders.totalMonths")}
                      name="edit-totalMonths"
                      defaultValue={editTotalMonths}
                      onChange={(event) => setEditTotalMonths(event.target.value)}
                    />
                  </div>
                  <div>
                    <Label>{t("resource.transactions.fields.paymentDay")}</Label>
                    <Input
                      type="number"
                      placeholder={t("resource.transactions.placeholders.paymentDay")}
                      name="edit-paymentDay"
                      defaultValue={editPaymentDay}
                      onChange={(event) => setEditPaymentDay(event.target.value)}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <MultiSelect
                    label={t("resource.common.fields.tags")}
                    options={tagOptions}
                    defaultSelected={editTagIds}
                    onChange={setEditTagIds}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>{t("resource.common.fields.observation")}</Label>
                  <TextArea
                    placeholder={t("resource.transactions.placeholders.observation")}
                    value={editObservation}
                    onChange={setEditObservation}
                  />
                </div>
                <Checkbox
                  checked={editActive}
                  onChange={setEditActive}
                  label={t("resource.common.status.active")}
                />
              </div>
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
                disabled={updateTransactionMutation.isPending}
              >
                {updateTransactionMutation.isPending
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




