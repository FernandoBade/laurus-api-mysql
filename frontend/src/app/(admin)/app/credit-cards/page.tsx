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
import { useAuth } from "@/features/auth/context";
import {
  useCreditCardsByUser,
  useCreateCreditCard,
  useDeleteCreditCard,
  useUpdateCreditCard,
} from "@/features/credit-cards/hooks";
import { useAccountsByUser } from "@/features/accounts/hooks";
import type { CreditCardFlag } from "@/shared/types/domain";
import { getApiErrorMessage } from "@/shared/lib/api/errors";
import { formatMoney } from "@/shared/lib/formatters";
import {
  isBlank,
  isNonNegativeNumber,
  parseNumberInput,
} from "@/shared/lib/validation";
import { EmptyState, ErrorState, LoadingState } from "@/shared/ui/states";
import { useTranslation } from "react-i18next";


export default function CreditCardsPage() {
  const { t } = useTranslation([
    "resource-creditCards",
    "resource-accounts",
    "resource-common",
  ]);
  const { userId } = useAuth();
  const cardsQuery = useCreditCardsByUser(userId);
  const accountsQuery = useAccountsByUser(userId);
  const createCardMutation = useCreateCreditCard(userId);
  const updateCardMutation = useUpdateCreditCard(userId);
  const deleteCardMutation = useDeleteCreditCard(userId);

  const [formKey, setFormKey] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [flag, setFlag] = useState<CreditCardFlag>("visa");
  const [balance, setBalance] = useState("");
  const [limit, setLimit] = useState("");
  const [observation, setObservation] = useState("");
  const [accountId, setAccountId] = useState("none");
  const [active, setActive] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editKey, setEditKey] = useState(0);
  const [editError, setEditError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editFlag, setEditFlag] = useState<CreditCardFlag>("visa");
  const [editBalance, setEditBalance] = useState("");
  const [editLimit, setEditLimit] = useState("");
  const [editObservation, setEditObservation] = useState("");
  const [editAccountId, setEditAccountId] = useState("none");
  const [editActive, setEditActive] = useState(true);

  const flagOptions = useMemo(
    () => [
      { value: "visa", label: t("resource.creditCards.flags.visa") },
      { value: "mastercard", label: t("resource.creditCards.flags.mastercard") },
      { value: "amex", label: t("resource.creditCards.flags.amex") },
      { value: "elo", label: t("resource.creditCards.flags.elo") },
      { value: "hipercard", label: t("resource.creditCards.flags.hipercard") },
      { value: "discover", label: t("resource.creditCards.flags.discover") },
      { value: "diners", label: t("resource.creditCards.flags.diners") },
    ],
    [t]
  );
  const flagLabels = useMemo(
    () => new Map(flagOptions.map((option) => [option.value, option.label])),
    [flagOptions]
  );

  const cards = useMemo(() => cardsQuery.data?.data ?? [], [cardsQuery.data]);
  const accounts = useMemo(
    () => accountsQuery.data?.data ?? [],
    [accountsQuery.data]
  );

  const accountOptions = useMemo(() => {
    const base = [
      { value: "none", label: t("resource.creditCards.account.none") },
    ];
    const mapped = accounts.map((account) => ({
      value: String(account.id),
      label:
        account.name ||
        t("resource.accounts.fallbacks.accountWithId", { id: account.id }),
    }));
    return base.concat(mapped);
  }, [accounts, t]);

  const accountNameMap = useMemo(() => {
    return new Map(accounts.map((account) => [account.id, account.name]));
  }, [accounts]);

  const resetForm = () => {
    setName("");
    setFlag("visa");
    setBalance("");
    setLimit("");
    setObservation("");
    setAccountId("none");
    setActive(true);
    setFormKey((prev) => prev + 1);
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!userId) {
      setFormError(t("resource.common.errors.missingSession"));
      return;
    }

    if (isBlank(name)) {
      setFormError(t("resource.creditCards.errors.nameRequired"));
      return;
    }

    const balanceResult = parseNumberInput(balance);
    if (
      balanceResult.error ||
      (balanceResult.value !== undefined &&
        !isNonNegativeNumber(balanceResult.value))
    ) {
      setFormError(t("resource.creditCards.errors.balancePositive"));
      return;
    }

    const limitResult = parseNumberInput(limit);
    if (
      limitResult.error ||
      (limitResult.value !== undefined &&
        !isNonNegativeNumber(limitResult.value))
    ) {
      setFormError(t("resource.creditCards.errors.limitPositive"));
      return;
    }

    const parsedBalance = balanceResult.value;
    const parsedLimit = limitResult.value;

    try {
      await createCardMutation.mutateAsync({
        name: name.trim(),
        flag,
        observation: observation.trim() || undefined,
        balance: parsedBalance,
        limit: parsedLimit,
        account_id: accountId !== "none" ? Number(accountId) : undefined,
        user_id: userId,
        active,
      });
      resetForm();
    } catch (error) {
      setFormError(getApiErrorMessage(error, t("resource.common.errors.generic")));
    }
  };

  const openEditModal = (card: (typeof cards)[number]) => {
    setEditId(card.id);
    setEditName(card.name || "");
    setEditFlag(card.flag);
    setEditBalance(card.balance ? String(card.balance) : "");
    setEditLimit(card.limit ? String(card.limit) : "");
    setEditObservation(card.observation || "");
    setEditAccountId(card.accountId ? String(card.accountId) : "none");
    setEditActive(card.active);
    setEditError(null);
    setEditKey((prev) => prev + 1);
    setIsEditOpen(true);
  };

  const handleEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEditError(null);

    if (!editId) {
      setEditError(t("resource.creditCards.errors.notSelected"));
      return;
    }

    if (isBlank(editName)) {
      setEditError(t("resource.creditCards.errors.nameRequired"));
      return;
    }

    const editBalanceResult = parseNumberInput(editBalance);
    if (
      editBalanceResult.error ||
      (editBalanceResult.value !== undefined &&
        !isNonNegativeNumber(editBalanceResult.value))
    ) {
      setEditError(t("resource.creditCards.errors.balancePositive"));
      return;
    }

    const editLimitResult = parseNumberInput(editLimit);
    if (
      editLimitResult.error ||
      (editLimitResult.value !== undefined &&
        !isNonNegativeNumber(editLimitResult.value))
    ) {
      setEditError(t("resource.creditCards.errors.limitPositive"));
      return;
    }

    const parsedBalance = editBalanceResult.value;
    const parsedLimit = editLimitResult.value;

    try {
      await updateCardMutation.mutateAsync({
        id: editId,
        payload: {
          name: editName.trim(),
          flag: editFlag,
          observation: editObservation.trim() || undefined,
          balance: parsedBalance,
          limit: parsedLimit,
          account_id: editAccountId !== "none" ? Number(editAccountId) : undefined,
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
      t("resource.creditCards.confirmDelete")
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteCardMutation.mutateAsync(id);
    } catch {
      // Error handled in mutation state.
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {t("resource.creditCards.title")}
        </h2>
      </div>

      <ComponentCard
        title={t("resource.creditCards.create.title")}
        desc={t("resource.creditCards.create.desc")}
      >
        <form onSubmit={handleCreate}>
          <div key={formKey} className="grid gap-5 md:grid-cols-2">
            {formError && (
              <div className="md:col-span-2">
                <Alert
                  variant="error"
                  title={t("resource.creditCards.create.errors.notCreated")}
                  message={formError}
                />
              </div>
            )}
            <div>
              <Label>
                {t("resource.common.fields.name")}{" "}
                <span className="text-error-500">*</span>
              </Label>
              <Input
                placeholder={t("resource.creditCards.placeholders.name")}
                name="name"
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div>
              <Label>
                {t("resource.creditCards.fields.flag")}{" "}
                <span className="text-error-500">*</span>
              </Label>
              <Select
                key={`create-flag-${formKey}`}
                options={flagOptions}
                defaultValue={flag}
                onChange={(value) => setFlag(value as CreditCardFlag)}
              />
            </div>
            <div>
              <Label>{t("resource.common.fields.limit")}</Label>
              <Input
                type="number"
                placeholder={t("resource.common.placeholders.amount")}
                name="limit"
                onChange={(event) => setLimit(event.target.value)}
              />
            </div>
            <div>
              <Label>{t("resource.common.fields.balance")}</Label>
              <Input
                type="number"
                placeholder={t("resource.common.placeholders.amount")}
                name="balance"
                onChange={(event) => setBalance(event.target.value)}
              />
            </div>
            <div>
              <Label>{t("resource.creditCards.fields.linkedAccount")}</Label>
              <Select
                key={`create-account-${formKey}`}
                options={accountOptions}
                defaultValue={accountId}
                onChange={setAccountId}
              />
            </div>
            <div>
              <Label>{t("resource.common.fields.observation")}</Label>
              <Input
                placeholder={t("resource.creditCards.placeholders.observation")}
                name="observation"
                onChange={(event) => setObservation(event.target.value)}
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-between">
              <Checkbox
                checked={active}
                onChange={setActive}
                label={t("resource.common.status.active")}
              />
              <Button
                className="min-w-[140px]"
                size="sm"
                disabled={createCardMutation.isPending}
              >
                {createCardMutation.isPending
                  ? t("resource.common.actions.saving")
                  : t("resource.creditCards.create.actions.submit")}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>

      <ComponentCard
        title={t("resource.creditCards.list.title")}
        desc={t("resource.creditCards.list.desc")}
      >
        {cardsQuery.isError && (
          <ErrorState
            title={t("resource.creditCards.list.unavailable")}
            message={getApiErrorMessage(
              cardsQuery.error,
              t("resource.common.errors.generic")
            )}
          />
        )}
        {deleteCardMutation.isError && (
          <ErrorState
            title={t("resource.common.errors.deleteFailed")}
            message={getApiErrorMessage(
              deleteCardMutation.error,
              t("resource.common.errors.generic")
            )}
          />
        )}
        {!cardsQuery.isError && cardsQuery.isLoading && (
          <LoadingState message={t("resource.creditCards.list.loading")} />
        )}
        {!cardsQuery.isError && !cardsQuery.isLoading && (
          <div className="overflow-x-auto">
            <div className="min-w-[880px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      {t("resource.common.fields.name")}
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      {t("resource.creditCards.fields.flag")}
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      {t("resource.common.fields.limit")}
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      {t("resource.common.fields.balance")}
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      {t("resource.creditCards.fields.linkedAccount")}
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
                  {cards.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <EmptyState message={t("resource.creditCards.list.empty")} />
                      </TableCell>
                    </TableRow>
                  ) : (
                    cards.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                          {card.name || t("resource.creditCards.list.unnamed")}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {flagLabels.get(card.flag) ?? card.flag}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                          {formatMoney(card.limit)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                          {formatMoney(card.balance)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {card.accountId
                            ? accountNameMap.get(card.accountId) ||
                              t("resource.accounts.fallbacks.accountWithId", {
                                id: card.accountId,
                              })
                            : t("resource.common.placeholders.emptyValue")}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {card.active
                            ? t("resource.common.status.active")
                            : t("resource.common.status.inactive")}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(card)}
                            >
                              {t("resource.common.actions.edit")}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={deleteCardMutation.isPending}
                              onClick={() => handleDelete(card.id)}
                            >
                              {t("resource.common.actions.delete")}
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
            {t("resource.creditCards.edit.title")}
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
              <div>
                <Label>
                  {t("resource.common.fields.name")}{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <Input
                  placeholder={t("resource.creditCards.placeholders.name")}
                  name="edit-name"
                  defaultValue={editName}
                  onChange={(event) => setEditName(event.target.value)}
                />
              </div>
              <div>
                <Label>
                  {t("resource.creditCards.fields.flag")}{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <Select
                  key={`edit-flag-${editKey}`}
                  options={flagOptions}
                  defaultValue={editFlag}
                  onChange={(value) => setEditFlag(value as CreditCardFlag)}
                />
              </div>
              <div>
                <Label>{t("resource.common.fields.limit")}</Label>
                <Input
                  type="number"
                  placeholder={t("resource.common.placeholders.amount")}
                  name="edit-limit"
                  defaultValue={editLimit}
                  onChange={(event) => setEditLimit(event.target.value)}
                />
              </div>
              <div>
                <Label>{t("resource.common.fields.balance")}</Label>
                <Input
                  type="number"
                  placeholder={t("resource.common.placeholders.amount")}
                  name="edit-balance"
                  defaultValue={editBalance}
                  onChange={(event) => setEditBalance(event.target.value)}
                />
              </div>
              <div>
                <Label>{t("resource.creditCards.fields.linkedAccount")}</Label>
                <Select
                  key={`edit-account-${editKey}`}
                  options={accountOptions}
                  defaultValue={editAccountId}
                  onChange={setEditAccountId}
                />
              </div>
              <div>
                <Label>{t("resource.common.fields.observation")}</Label>
                <Input
                  placeholder={t("resource.creditCards.placeholders.observation")}
                  name="edit-observation"
                  defaultValue={editObservation}
                  onChange={(event) => setEditObservation(event.target.value)}
                />
              </div>
              <Checkbox
                checked={editActive}
                onChange={setEditActive}
                label={t("resource.common.status.active")}
              />
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
                disabled={updateCardMutation.isPending}
              >
                {updateCardMutation.isPending
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


