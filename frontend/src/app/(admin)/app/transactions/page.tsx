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
import { useAuth } from "@/context/AuthContext";
import { useAccountsByUser } from "@/api/accounts.hooks";
import { useCreditCardsByUser } from "@/api/creditCards.hooks";
import { useCategoriesByUser } from "@/api/categories.hooks";
import { useTagsByUser } from "@/api/tags.hooks";
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from "@/api/transactions.hooks";
import type { TransactionSource, TransactionType } from "@/api/shared.types";
import { getApiErrorMessage } from "@/api/errorHandling";

const typeOptions = [
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
];

const sourceOptions = [
  { value: "account", label: "Account" },
  { value: "creditCard", label: "Credit Card" },
];

const formatAmount = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return "0.00";
  }
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isNaN(numeric) ? String(value) : numeric.toFixed(2);
};

const toInputDate = (value: string | null | undefined) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().split("T")[0];
};

export default function TransactionsPage() {
  const { userId } = useAuth();
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
        label: account.name || `Account #${account.id}`,
      })),
    [accounts]
  );

  const cardOptions = useMemo(
    () =>
      cards.map((card) => ({
        value: String(card.id),
        label: card.name || `Card #${card.id}`,
      })),
    [cards]
  );

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: String(category.id),
        label: category.name || `Category #${category.id}`,
      })),
    [categories]
  );

  const tagOptions = useMemo(
    () =>
      tags.map((tag) => ({
        value: String(tag.id),
        text: tag.name || `Tag #${tag.id}`,
        selected: false,
      })),
    [tags]
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
    if (!amount.trim() || Number(amount) <= 0) {
      return "Value must be greater than zero.";
    }
    if (!dateValue) {
      return "Date is required.";
    }
    if (!categoryValue) {
      return "Category is required.";
    }
    if (source === "account" && !accountValue) {
      return "Account is required for account transactions.";
    }
    if (source === "creditCard" && !cardValue) {
      return "Credit card is required for card transactions.";
    }
    if (installment && !months) {
      return "Total months is required for installments.";
    }
    if (recurring && !paymentValue) {
      return "Payment day is required for recurring transactions.";
    }
    if (installment && recurring) {
      return "A transaction cannot be both installment and recurring.";
    }
    if (paymentValue) {
      const payment = Number(paymentValue);
      if (Number.isNaN(payment) || payment < 1 || payment > 31) {
        return "Payment day must be between 1 and 31.";
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
      await createTransactionMutation.mutateAsync({
        value: Number(value),
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
      setFormError(getApiErrorMessage(error));
    }
  };

  const openEditModal = (transaction: (typeof filteredTransactions)[number]) => {
    setEditId(transaction.id);
    setEditValue(transaction.value ? String(transaction.value) : "");
    setEditDate(toInputDate(transaction.date));
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
      setEditError("Transaction not selected.");
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
      await updateTransactionMutation.mutateAsync({
        id: editId,
        payload: {
          value: Number(editValue),
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
      setEditError(getApiErrorMessage(error));
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
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
          Transactions
        </h2>
      </div>

      <ComponentCard title="Create Transaction" desc="Record a new transaction">
        <form onSubmit={handleCreate}>
          <div key={formKey} className="grid gap-5 lg:grid-cols-2">
            {formError && (
              <div className="lg:col-span-2">
                <Alert
                  variant="error"
                  title="Transaction not created"
                  message={formError}
                />
              </div>
            )}
            <div>
              <Label>
                Value <span className="text-error-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                name="value"
                onChange={(event) => setValue(event.target.value)}
              />
            </div>
            <div>
              <Label>
                Date <span className="text-error-500">*</span>
              </Label>
              <Input
                type="date"
                name="date"
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
            <div>
              <Label>
                Category <span className="text-error-500">*</span>
              </Label>
              <Select
                key={`create-category-${formKey}`}
                options={categoryOptions}
                placeholder="Select category"
                onChange={setCategoryId}
              />
            </div>
            <div>
              <Label>
                Type <span className="text-error-500">*</span>
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
                Source <span className="text-error-500">*</span>
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
                  Account <span className="text-error-500">*</span>
                </Label>
                <Select
                  key={`create-account-${formKey}`}
                  options={accountOptions}
                  placeholder="Select account"
                  onChange={setAccountId}
                />
              </div>
            ) : (
              <div>
                <Label>
                  Credit Card <span className="text-error-500">*</span>
                </Label>
                <Select
                  key={`create-card-${formKey}`}
                  options={cardOptions}
                  placeholder="Select card"
                  onChange={setCardId}
                />
              </div>
            )}
            <div className="flex flex-col gap-4">
              <Checkbox
                checked={isInstallment}
                onChange={setIsInstallment}
                label="Installment"
              />
              <Checkbox
                checked={isRecurring}
                onChange={setIsRecurring}
                label="Recurring"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Total Months</Label>
                <Input
                  type="number"
                  placeholder="e.g. 12"
                  name="totalMonths"
                  onChange={(event) => setTotalMonths(event.target.value)}
                />
              </div>
              <div>
                <Label>Payment Day</Label>
                <Input
                  type="number"
                  placeholder="1-31"
                  name="paymentDay"
                  onChange={(event) => setPaymentDay(event.target.value)}
                />
              </div>
            </div>
            <div className="lg:col-span-2">
              <MultiSelect
                label="Tags"
                options={tagOptions}
                defaultSelected={tagIds}
                onChange={setTagIds}
              />
            </div>
            <div className="lg:col-span-2">
              <Label>Observation</Label>
              <TextArea
                placeholder="Add notes"
                value={observation}
                onChange={setObservation}
              />
            </div>
            <div className="lg:col-span-2 flex items-center justify-between">
              <Checkbox checked={active} onChange={setActive} label="Active" />
              <Button
                className="min-w-[160px]"
                size="sm"
                disabled={createTransactionMutation.isPending}
              >
                {createTransactionMutation.isPending
                  ? "Saving..."
                  : "Create Transaction"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>

      <ComponentCard title="Transactions List" desc="Manage transactions">
        {transactionsQuery.isError && (
          <Alert
            variant="error"
            title="Transactions unavailable"
            message={getApiErrorMessage(transactionsQuery.error)}
          />
        )}
        {deleteTransactionMutation.isError && (
          <Alert
            variant="error"
            title="Delete failed"
            message={getApiErrorMessage(deleteTransactionMutation.error)}
          />
        )}
        {!transactionsQuery.isError && transactionsQuery.isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading transactions...
          </p>
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
                      Date
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
                      Source
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Category
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Amount
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
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        No transactions available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => {
                      const sourceLabel =
                        transaction.transactionSource === "account"
                          ? accountMap.get(transaction.accountId ?? -1) ||
                            `Account #${transaction.accountId ?? "-"}`
                          : cardMap.get(transaction.creditCardId ?? -1) ||
                            `Card #${transaction.creditCardId ?? "-"}`;
                      const categoryLabel = transaction.categoryId
                        ? categoryMap.get(transaction.categoryId) ||
                          `Category #${transaction.categoryId}`
                        : "-";
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {new Date(transaction.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {transaction.transactionType}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {sourceLabel}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {categoryLabel}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                            {formatAmount(transaction.value)}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {transaction.active ? "Active" : "Inactive"}
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditModal(transaction)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={deleteTransactionMutation.isPending}
                                onClick={() => handleDelete(transaction.id)}
                              >
                                Delete
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
            Edit Transaction
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
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>
                    Value <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    name="edit-value"
                    defaultValue={editValue}
                    onChange={(event) => setEditValue(event.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    Date <span className="text-error-500">*</span>
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
                    Category <span className="text-error-500">*</span>
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
                    Type <span className="text-error-500">*</span>
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
                    Source <span className="text-error-500">*</span>
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
                      Account <span className="text-error-500">*</span>
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
                      Credit Card <span className="text-error-500">*</span>
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
                    label="Installment"
                  />
                  <Checkbox
                    checked={editIsRecurring}
                    onChange={setEditIsRecurring}
                    label="Recurring"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Total Months</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 12"
                      name="edit-totalMonths"
                      defaultValue={editTotalMonths}
                      onChange={(event) => setEditTotalMonths(event.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Payment Day</Label>
                    <Input
                      type="number"
                      placeholder="1-31"
                      name="edit-paymentDay"
                      defaultValue={editPaymentDay}
                      onChange={(event) => setEditPaymentDay(event.target.value)}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <MultiSelect
                    label="Tags"
                    options={tagOptions}
                    defaultSelected={editTagIds}
                    onChange={setEditTagIds}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Observation</Label>
                  <TextArea
                    placeholder="Add notes"
                    value={editObservation}
                    onChange={setEditObservation}
                  />
                </div>
                <Checkbox
                  checked={editActive}
                  onChange={setEditActive}
                  label="Active"
                />
              </div>
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
                disabled={updateTransactionMutation.isPending}
              >
                {updateTransactionMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
