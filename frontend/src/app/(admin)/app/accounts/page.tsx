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
import { useAuth } from "@/context/AuthContext";
import {
  useAccountsByUser,
  useCreateAccount,
  useDeleteAccount,
  useUpdateAccount,
} from "@/api/accounts.hooks";
import type { AccountType } from "@/api/shared.types";
import { getApiErrorMessage } from "@/api/errorHandling";

const accountTypeOptions = [
  { value: "checking", label: "Checking" },
  { value: "payroll", label: "Payroll" },
  { value: "savings", label: "Savings" },
  { value: "investment", label: "Investment" },
  { value: "loan", label: "Loan" },
  { value: "other", label: "Other" },
];

const formatAmount = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return "0.00";
  }
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isNaN(numeric) ? String(value) : numeric.toFixed(2);
};

export default function AccountsPage() {
  const { userId } = useAuth();
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
      setFormError("Missing user session.");
      return;
    }

    if (!name.trim() || !institution.trim()) {
      setFormError("Name and institution are required.");
      return;
    }

    let parsedBalance: number | undefined;
    if (balance.trim()) {
      parsedBalance = Number(balance);
      if (Number.isNaN(parsedBalance) || parsedBalance < 0) {
        setFormError("Balance must be a positive number.");
        return;
      }
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
      setFormError(getApiErrorMessage(error));
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
      setEditError("Account not selected.");
      return;
    }

    if (!editName.trim() || !editInstitution.trim()) {
      setEditError("Name and institution are required.");
      return;
    }

    let parsedBalance: number | undefined;
    if (editBalance.trim()) {
      parsedBalance = Number(editBalance);
      if (Number.isNaN(parsedBalance) || parsedBalance < 0) {
        setEditError("Balance must be a positive number.");
        return;
      }
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
      setEditError(getApiErrorMessage(error));
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this account?"
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
          Accounts
        </h2>
      </div>

      <ComponentCard title="Create Account" desc="Add a new financial account">
        <form onSubmit={handleCreate}>
          <div key={formKey} className="grid gap-5 md:grid-cols-2">
            {formError && (
              <div className="md:col-span-2">
                <Alert
                  variant="error"
                  title="Account not created"
                  message={formError}
                />
              </div>
            )}
            <div>
              <Label>
                Name <span className="text-error-500">*</span>
              </Label>
              <Input
                placeholder="Account name"
                name="name"
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div>
              <Label>
                Institution <span className="text-error-500">*</span>
              </Label>
              <Input
                placeholder="Bank or institution"
                name="institution"
                onChange={(event) => setInstitution(event.target.value)}
              />
            </div>
            <div>
              <Label>
                Type <span className="text-error-500">*</span>
              </Label>
              <Select
                key={`create-type-${formKey}`}
                options={accountTypeOptions}
                defaultValue={accountType}
                onChange={(value) => setAccountType(value as AccountType)}
              />
            </div>
            <div>
              <Label>Opening Balance</Label>
              <Input
                type="number"
                placeholder="0.00"
                name="balance"
                onChange={(event) => setBalance(event.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Observation</Label>
              <Input
                placeholder="Notes about this account"
                name="observation"
                onChange={(event) => setObservation(event.target.value)}
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-between">
              <Checkbox
                checked={active}
                onChange={setActive}
                label="Active"
              />
              <Button
                className="min-w-[140px]"
                size="sm"
                disabled={createAccountMutation.isPending}
              >
                {createAccountMutation.isPending ? "Saving..." : "Create Account"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>

      <ComponentCard title="Accounts List" desc="Manage your accounts">
        {accountsQuery.isError && (
          <Alert
            variant="error"
            title="Accounts unavailable"
            message={getApiErrorMessage(accountsQuery.error)}
          />
        )}
        {deleteAccountMutation.isError && (
          <Alert
            variant="error"
            title="Delete failed"
            message={getApiErrorMessage(deleteAccountMutation.error)}
          />
        )}
        {!accountsQuery.isError && accountsQuery.isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading accounts...
          </p>
        )}
        {!accountsQuery.isError && !accountsQuery.isLoading && (
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Institution
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
                      Balance
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
                  {accounts.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        No accounts available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    accounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                          {account.name || "Unnamed"}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {account.institution || "-"}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {account.type}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                          {formatAmount(account.balance)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {account.active ? "Active" : "Inactive"}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(account)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={deleteAccountMutation.isPending}
                              onClick={() => handleDelete(account.id)}
                            >
                              Delete
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
            Edit Account
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
              <div>
                <Label>
                  Name <span className="text-error-500">*</span>
                </Label>
                <Input
                  placeholder="Account name"
                  name="edit-name"
                  defaultValue={editName}
                  onChange={(event) => setEditName(event.target.value)}
                />
              </div>
              <div>
                <Label>
                  Institution <span className="text-error-500">*</span>
                </Label>
                <Input
                  placeholder="Bank or institution"
                  name="edit-institution"
                  defaultValue={editInstitution}
                  onChange={(event) => setEditInstitution(event.target.value)}
                />
              </div>
              <div>
                <Label>
                  Type <span className="text-error-500">*</span>
                </Label>
                <Select
                  key={`edit-type-${editKey}`}
                  options={accountTypeOptions}
                  defaultValue={editAccountType}
                  onChange={(value) => setEditAccountType(value as AccountType)}
                />
              </div>
              <div>
                <Label>Balance</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  name="edit-balance"
                  defaultValue={editBalance}
                  onChange={(event) => setEditBalance(event.target.value)}
                />
              </div>
              <div>
                <Label>Observation</Label>
                <Input
                  placeholder="Notes"
                  name="edit-observation"
                  defaultValue={editObservation}
                  onChange={(event) => setEditObservation(event.target.value)}
                />
              </div>
              <Checkbox
                checked={editActive}
                onChange={setEditActive}
                label="Active"
              />
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
                disabled={updateAccountMutation.isPending}
              >
                {updateAccountMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
