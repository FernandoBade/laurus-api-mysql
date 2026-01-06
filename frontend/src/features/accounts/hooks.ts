import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAccount,
  deleteAccount,
  getAccountsByUser,
  updateAccount,
} from "./api";
import type {
  CreateAccountPayload,
  UpdateAccountPayload,
} from "./types";
import type { QueryParams } from "@/shared/types/api";

const accountsKey = (userId: number | null, params?: QueryParams) => [
  "accounts",
  userId,
  params,
];
const accountsBaseKey = (userId: number | null) => ["accounts", userId];

export const useAccountsByUser = (
  userId: number | null,
  params?: QueryParams
) =>
  useQuery({
    queryKey: accountsKey(userId, params),
    queryFn: () => getAccountsByUser(userId as number, params),
    enabled: Boolean(userId),
  });

export const useCreateAccount = (userId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAccountPayload) => createAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsBaseKey(userId) });
    },
  });
};

export const useUpdateAccount = (userId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateAccountPayload;
    }) => updateAccount(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsBaseKey(userId) });
    },
  });
};

export const useDeleteAccount = (userId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsBaseKey(userId) });
    },
  });
};
