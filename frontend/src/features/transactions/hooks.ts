import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  getTransactionsByAccount,
  getTransactionsByUser,
  updateTransaction,
} from "./api";
import type {
  CreateTransactionPayload,
  UpdateTransactionPayload,
} from "./types";
import type { QueryParams } from "@/shared/types/api";

const transactionsKey = (params?: QueryParams) => [
  "transactions",
  params,
];

const transactionsByAccountKey = (
  accountId: number | null,
  params?: QueryParams
) => ["transactions", "account", accountId, params];

const transactionsByUserKey = (
  userId: number | null,
  params?: QueryParams
) => ["transactions", "user", userId, params];

export const useTransactions = (params?: QueryParams) =>
  useQuery({
    queryKey: transactionsKey(params),
    queryFn: () => getTransactions(params),
  });

export const useTransactionsByAccount = (
  accountId: number | null,
  params?: QueryParams
) =>
  useQuery({
    queryKey: transactionsByAccountKey(accountId, params),
    queryFn: () => getTransactionsByAccount(accountId as number, params),
    enabled: Boolean(accountId),
  });

export const useTransactionsByUser = (
  userId: number | null,
  params?: QueryParams
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
