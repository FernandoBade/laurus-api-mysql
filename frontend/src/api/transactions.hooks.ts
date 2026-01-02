import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  getTransactionsByAccount,
  getTransactionsByUser,
  updateTransaction,
} from "./transactions.api";
import type {
  CreateTransactionPayload,
  UpdateTransactionPayload,
} from "./transactions.types";

const transactionsKey = (params?: Record<string, any>) => [
  "transactions",
  params,
];

const transactionsByAccountKey = (
  accountId: number | null,
  params?: Record<string, any>
) => ["transactions", "account", accountId, params];

const transactionsByUserKey = (
  userId: number | null,
  params?: Record<string, any>
) => ["transactions", "user", userId, params];

export const useTransactions = (params?: Record<string, any>) =>
  useQuery({
    queryKey: transactionsKey(params),
    queryFn: () => getTransactions(params),
  });

export const useTransactionsByAccount = (
  accountId: number | null,
  params?: Record<string, any>
) =>
  useQuery({
    queryKey: transactionsByAccountKey(accountId, params),
    queryFn: () => getTransactionsByAccount(accountId as number, params),
    enabled: Boolean(accountId),
  });

export const useTransactionsByUser = (
  userId: number | null,
  params?: Record<string, any>
) =>
  useQuery({
    queryKey: transactionsByUserKey(userId, params),
    queryFn: () => getTransactionsByUser(userId as number, params),
    enabled: Boolean(userId),
  });

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) =>
      createTransaction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateTransactionPayload;
    }) => updateTransaction(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};
