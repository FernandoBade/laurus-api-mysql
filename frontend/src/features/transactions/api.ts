import type { ApiListResponse, ApiResponse, QueryParams } from "@/shared/types/api";
import { apiDelete, apiGet, apiPost, apiPut } from "@/shared/lib/api/client";
import type {
  CreateTransactionPayload,
  Transaction,
  TransactionGroup,
  UpdateTransactionPayload,
} from "./types";

export const getTransactions = (
  params?: QueryParams
): Promise<ApiListResponse<Transaction>> =>
  apiGet<Transaction[], ApiListResponse<Transaction>>("/transactions", params);

export const getTransactionsByAccount = (
  accountId: number,
  params?: QueryParams
): Promise<ApiListResponse<Transaction>> =>
  apiGet<Transaction[], ApiListResponse<Transaction>>(
    `/transactions/account/${accountId}`,
    params
  );

export const getTransactionsByUser = (
  userId: number,
  params?: QueryParams
): Promise<ApiListResponse<TransactionGroup>> =>
  apiGet<TransactionGroup[], ApiListResponse<TransactionGroup>>(
    `/transactions/user/${userId}`,
    params
  );

export const createTransaction = (
  payload: CreateTransactionPayload
): Promise<ApiResponse<Transaction>> =>
  apiPost<Transaction>("/transactions", payload);

export const updateTransaction = (
  id: number,
  payload: UpdateTransactionPayload
): Promise<ApiResponse<Transaction>> =>
  apiPut<Transaction>(`/transactions/${id}`, payload);

export const deleteTransaction = (
  id: number
): Promise<ApiResponse<{ id: number }>> =>
  apiDelete<{ id: number }>(`/transactions/${id}`);
