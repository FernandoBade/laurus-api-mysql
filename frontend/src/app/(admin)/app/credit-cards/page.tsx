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
  useCreditCardsByUser,
  useCreateCreditCard,
  useDeleteCreditCard,
  useUpdateCreditCard,
} from "@/api/creditCards.hooks";
import { useAccountsByUser } from "@/api/accounts.hooks";
import type { CreditCardFlag } from "@/api/shared.types";
import { getApiErrorMessage } from "@/api/errorHandling";

const flagOptions = [
  { value: "visa", label: "Visa" },
  { value: "mastercard", label: "Mastercard" },
  { value: "amex", label: "Amex" },
  { value: "elo", label: "Elo" },
  { value: "hipercard", label: "Hipercard" },
  { value: "discover", label: "Discover" },
  { value: "diners", label: "Diners" },
];

const formatAmount = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return "0.00";
  }
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isNaN(numeric) ? String(value) : numeric.toFixed(2);
};

export default function CreditCardsPage() {
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

  const cards = useMemo(() => cardsQuery.data?.data ?? [], [cardsQuery.data]);
  const accounts = useMemo(
    () => accountsQuery.data?.data ?? [],
    [accountsQuery.data]
  );

  const accountOptions = useMemo(() => {
    const base = [{ value: "none", label: "No linked account" }];
    const mapped = accounts.map((account) => ({
      value: String(account.id),
      label: account.name || `Account #${account.id}`,
    }));
    return base.concat(mapped);
  }, [accounts]);

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
      setFormError("Missing user session.");
      return;
    }

    if (!name.trim()) {
      setFormError("Name is required.");
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

    let parsedLimit: number | undefined;
    if (limit.trim()) {
      parsedLimit = Number(limit);
      if (Number.isNaN(parsedLimit) || parsedLimit < 0) {
        setFormError("Limit must be a positive number.");
        return;
      }
    }

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
      setFormError(getApiErrorMessage(error));
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
      setEditError("Card not selected.");
      return;
    }

    if (!editName.trim()) {
      setEditError("Name is required.");
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

    let parsedLimit: number | undefined;
    if (editLimit.trim()) {
      parsedLimit = Number(editLimit);
      if (Number.isNaN(parsedLimit) || parsedLimit < 0) {
        setEditError("Limit must be a positive number.");
        return;
      }
    }

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
      setEditError(getApiErrorMessage(error));
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this credit card?"
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
          Credit Cards
        </h2>
      </div>

      <ComponentCard title="Add Credit Card" desc="Track your card balances">
        <form onSubmit={handleCreate}>
          <div key={formKey} className="grid gap-5 md:grid-cols-2">
            {formError && (
              <div className="md:col-span-2">
                <Alert
                  variant="error"
                  title="Card not created"
                  message={formError}
                />
              </div>
            )}
            <div>
              <Label>
                Name <span className="text-error-500">*</span>
              </Label>
              <Input
                placeholder="Card name"
                name="name"
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div>
              <Label>
                Flag <span className="text-error-500">*</span>
              </Label>
              <Select
                key={`create-flag-${formKey}`}
                options={flagOptions}
                defaultValue={flag}
                onChange={(value) => setFlag(value as CreditCardFlag)}
              />
            </div>
            <div>
              <Label>Limit</Label>
              <Input
                type="number"
                placeholder="0.00"
                name="limit"
                onChange={(event) => setLimit(event.target.value)}
              />
            </div>
            <div>
              <Label>Balance</Label>
              <Input
                type="number"
                placeholder="0.00"
                name="balance"
                onChange={(event) => setBalance(event.target.value)}
              />
            </div>
            <div>
              <Label>Linked Account</Label>
              <Select
                key={`create-account-${formKey}`}
                options={accountOptions}
                defaultValue={accountId}
                onChange={setAccountId}
              />
            </div>
            <div>
              <Label>Observation</Label>
              <Input
                placeholder="Notes"
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
                disabled={createCardMutation.isPending}
              >
                {createCardMutation.isPending ? "Saving..." : "Create Card"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>

      <ComponentCard title="Cards List" desc="Manage your cards">
        {cardsQuery.isError && (
          <Alert
            variant="error"
            title="Cards unavailable"
            message={getApiErrorMessage(cardsQuery.error)}
          />
        )}
        {deleteCardMutation.isError && (
          <Alert
            variant="error"
            title="Delete failed"
            message={getApiErrorMessage(deleteCardMutation.error)}
          />
        )}
        {!cardsQuery.isError && cardsQuery.isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading cards...
          </p>
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
                      Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Flag
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Limit
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
                      Linked Account
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
                  {cards.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        No credit cards available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    cards.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                          {card.name || "Unnamed"}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {card.flag}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                          {formatAmount(card.limit)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                          {formatAmount(card.balance)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {card.accountId
                            ? accountNameMap.get(card.accountId) ||
                              `Account #${card.accountId}`
                            : "-"}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {card.active ? "Active" : "Inactive"}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(card)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={deleteCardMutation.isPending}
                              onClick={() => handleDelete(card.id)}
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
            Edit Credit Card
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
                  placeholder="Card name"
                  name="edit-name"
                  defaultValue={editName}
                  onChange={(event) => setEditName(event.target.value)}
                />
              </div>
              <div>
                <Label>
                  Flag <span className="text-error-500">*</span>
                </Label>
                <Select
                  key={`edit-flag-${editKey}`}
                  options={flagOptions}
                  defaultValue={editFlag}
                  onChange={(value) => setEditFlag(value as CreditCardFlag)}
                />
              </div>
              <div>
                <Label>Limit</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  name="edit-limit"
                  defaultValue={editLimit}
                  onChange={(event) => setEditLimit(event.target.value)}
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
                <Label>Linked Account</Label>
                <Select
                  key={`edit-account-${editKey}`}
                  options={accountOptions}
                  defaultValue={editAccountId}
                  onChange={setEditAccountId}
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
                disabled={updateCardMutation.isPending}
              >
                {updateCardMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
