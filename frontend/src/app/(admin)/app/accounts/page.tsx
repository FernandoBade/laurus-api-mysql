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
import { useAuthSession } from "@/features/auth/context";
import {
  useAccountsByUser,
  useCreateAccount,
  useDeleteAccount,
  useUpdateAccount,
} from "@/features/accounts/hooks";
import type { AccountType } from "@/shared/types/domain";
import { getApiErrorMessage } from "@/shared/lib/api/errors";
import { formatMoney } from "@/shared/lib/formatters";
import { EmptyState, ErrorState, LoadingState } from "@/shared/ui";
import { useTranslation } from "react-i18next";



export default function AccountsPage() {
  const { t } = useTranslation([
    "resource-accounts",
    "resource-common",
    "resource-transactions",
  ]);
  const { userId } = useAuthSession();
  const accountsQuery = useAccountsByUser(userId);
  const createAccountMutation = useCreateAccount(userId);
  const updateAccountMutation = useUpdateAccount(userId);
  const deleteAccountMutation = useDeleteAccount(userId);

  const [formKey, setFormKey] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("other");
  const [observation, setObservation] = useState("");
  const [balance, setBalance] = useState("");
  const [active, setActive] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editKey, setEditKey] = useState(0);
  const [editError, setEditError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editInstitution, setEditInstitution] = useState("");
  const [editAccountType, setEditAccountType] = useState<AccountType>("other");
  const [editObservation, setEditObservation] = useState("");
  const [editBalance, setEditBalance] = useState("");
  const [editActive, setEditActive] = useState(true);

  const accountTypeOptions = useMemo(
    () => [
      { value: "checking", label: t("resource.accounts.types.checking") },
      { value: "payroll", label: t("resource.accounts.types.payroll") },
      { value: "savings", label: t("resource.accounts.types.savings") },
      { value: "investment", label: t("resource.accounts.types.investment") },
      { value: "loan", label: t("resource.accounts.types.loan") },
      { value: "other", label: t("resource.accounts.types.other") },
    ],
    [t]
  );
  const accountTypeLabels = useMemo(
    () => new Map(accountTypeOptions.map((option) => [option.value, option.label])),
    [accountTypeOptions]
  );

  const accounts = useMemo(() => accountsQuery.data?.data ?? [], [accountsQuery.data]);

  const resetForm = () => {
    setName("");
    setInstitution("");
    setAccountType("other");
    setObservation("");
    setBalance("");
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

    if (!name.trim() || !institution.trim()) {
      setFormError(t("resource.accounts.errors.nameInstitutionRequired"));
      return;
    }

    const trimmedBalance = balance.trim();
    let parsedBalance: number | undefined;
    if (trimmedBalance) {
      const numericBalance = Number(trimmedBalance);
      if (Number.isNaN(numericBalance) || numericBalance < 0) {
        setFormError(t("resource.accounts.errors.balancePositive"));
        return;
      }
      parsedBalance = numericBalance;
    }

    try {
      await createAccountMutation.mutateAsync({
        name: name.trim(),
        institution: institution.trim(),
        type: accountType,
        observation: observation.trim() || undefined,
        balance: parsedBalance,
        user_id: userId,
        active,
      });
      resetForm();
    } catch (error) {
      setFormError(getApiErrorMessage(error, t("resource.common.errors.generic")));
    }
  };

  const openEditModal = (account: (typeof accounts)[number]) => {
    setEditId(account.id);
    setEditName(account.name || "");
    setEditInstitution(account.institution || "");
    setEditAccountType(account.type);
    setEditObservation(account.observation || "");
    setEditBalance(account.balance ? String(account.balance) : "");
    setEditActive(account.active);
    setEditError(null);
    setEditKey((prev) => prev + 1);
    setIsEditOpen(true);
  };

  const handleEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEditError(null);

    if (!editId) {
      setEditError(t("resource.accounts.errors.notSelected"));
      return;
    }

    if (!editName.trim() || !editInstitution.trim()) {
      setEditError(t("resource.accounts.errors.nameInstitutionRequired"));
      return;
    }

    const trimmedBalance = editBalance.trim();
    let parsedBalance: number | undefined;
    if (trimmedBalance) {
      const numericBalance = Number(trimmedBalance);
      if (Number.isNaN(numericBalance) || numericBalance < 0) {
        setEditError(t("resource.accounts.errors.balancePositive"));
        return;
      }
      parsedBalance = numericBalance;
    }

    try {
      await updateAccountMutation.mutateAsync({
        id: editId,
        payload: {
          name: editName.trim(),
          institution: editInstitution.trim(),
          type: editAccountType,
          observation: editObservation.trim() || undefined,
          balance: parsedBalance,
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
      t("resource.accounts.confirmDelete")
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteAccountMutation.mutateAsync(id);
    } catch {
      // Errors are handled in the mutation state below.
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {t("resource.accounts.title")}
        </h2>
      </div>

      <ComponentCard
        title={t("resource.accounts.create.title")}
        desc={t("resource.accounts.create.desc")}
      >
        <form onSubmit={handleCreate}>
          <div key={formKey} className="grid gap-5 md:grid-cols-2">
            {formError && (
              <div className="md:col-span-2">
                <Alert
                  variant="error"
                  title={t("resource.accounts.create.errors.notCreated")}
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
                placeholder={t("resource.accounts.placeholders.name")}
                name="name"
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div>
              <Label>
                {t("resource.common.fields.institution")}{" "}
                <span className="text-error-500">*</span>
              </Label>
              <Input
                placeholder={t("resource.accounts.placeholders.institution")}
                name="institution"
                onChange={(event) => setInstitution(event.target.value)}
              />
            </div>
            <div>
              <Label>
                {t("resource.common.fields.type")}{" "}
                <span className="text-error-500">*</span>
              </Label>
              <Select
                key={`create-type-${formKey}`}
                options={accountTypeOptions}
                defaultValue={accountType}
                onChange={(value) => setAccountType(value as AccountType)}
              />
            </div>
            <div>
              <Label>{t("resource.common.fields.openingBalance")}</Label>
              <Input
                type="number"
                placeholder={t("resource.common.placeholders.amount")}
                name="balance"
                onChange={(event) => setBalance(event.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label>{t("resource.common.fields.observation")}</Label>
              <Input
                placeholder={t("resource.accounts.placeholders.observation")}
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
                disabled={createAccountMutation.isPending}
              >
                {createAccountMutation.isPending
                  ? t("resource.common.actions.saving")
                  : t("resource.accounts.create.actions.submit")}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>

      <ComponentCard
        title={t("resource.accounts.list.title")}
        desc={t("resource.accounts.list.desc")}
      >
        {accountsQuery.isError && (
          <ErrorState
            title={t("resource.accounts.list.unavailable")}
            message={getApiErrorMessage(
              accountsQuery.error,
              t("resource.common.errors.generic")
            )}
          />
        )}
        {deleteAccountMutation.isError && (
          <ErrorState
            title={t("resource.common.errors.deleteFailed")}
            message={getApiErrorMessage(
              deleteAccountMutation.error,
              t("resource.common.errors.generic")
            )}
          />
        )}
        {!accountsQuery.isError && accountsQuery.isLoading && (
          <LoadingState message={t("resource.accounts.list.loading")} />
        )}
        {!accountsQuery.isError && !accountsQuery.isLoading && (
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/5">
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
                      {t("resource.common.fields.institution")}
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
                      {t("resource.common.fields.balance")}
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
                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                  {accounts.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <EmptyState message={t("resource.accounts.list.empty")} />
                      </TableCell>
                    </TableRow>
                  ) : (
                    accounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                          {account.name || t("resource.accounts.list.unnamed")}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {account.institution || t("resource.common.placeholders.emptyValue")}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {accountTypeLabels.get(account.type) ?? account.type}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                          {formatMoney(account.balance)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {account.active
                            ? t("resource.common.status.active")
                            : t("resource.common.status.inactive")}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(account)}
                            >
                              {t("resource.common.actions.edit")}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={deleteAccountMutation.isPending}
                              onClick={() => handleDelete(account.id)}
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
            {t("resource.accounts.edit.title")}
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
                  placeholder={t("resource.accounts.placeholders.name")}
                  name="edit-name"
                  defaultValue={editName}
                  onChange={(event) => setEditName(event.target.value)}
                />
              </div>
              <div>
                <Label>
                  {t("resource.common.fields.institution")}{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <Input
                  placeholder={t("resource.accounts.placeholders.institution")}
                  name="edit-institution"
                  defaultValue={editInstitution}
                  onChange={(event) => setEditInstitution(event.target.value)}
                />
              </div>
              <div>
                <Label>
                  {t("resource.common.fields.type")}{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <Select
                  key={`edit-type-${editKey}`}
                  options={accountTypeOptions}
                  defaultValue={editAccountType}
                  onChange={(value) => setEditAccountType(value as AccountType)}
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
                <Label>{t("resource.common.fields.observation")}</Label>
                <Input
                  placeholder={t("resource.accounts.placeholders.notes")}
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
                disabled={updateAccountMutation.isPending}
              >
                {updateAccountMutation.isPending
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




