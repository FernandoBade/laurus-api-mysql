import type { ApiListResponse, ApiResponse } from "./api.types";
import type {
  CreateTransactionPayload,
  Transaction,
  TransactionGroup,
  UpdateTransactionPayload,
} from "./transactions.types";
import { httpClient } from "./httpClient";

export const getTransactions = async (
  params?: Record<string, string | number>
) => {
  const response = await httpClient.get<ApiListResponse<Transaction>>(
    "/transactions",
    { params }
  );
  return response.data;
};

export const getTransactionsByAccount = async (
  accountId: number,
  params?: Record<string, string | number>
) => {
  const response = await httpClient.get<ApiListResponse<Transaction>>(
    `/transactions/account/${accountId}`,
    { params }
  );
  return response.data;
};

export const getTransactionsByUser = async (
  userId: number,
  params?: Record<string, string | number>
) => {
  const response = await httpClient.get<ApiListResponse<TransactionGroup>>(
    `/transactions/user/${userId}`,
    { params }
  );
  return response.data;
};

export const createTransaction = async (payload: CreateTransactionPayload) => {
  const response = await httpClient.post<ApiResponse<Transaction>>(
    "/transactions",
    payload
  );
  return response.data;
};

export const updateTransaction = async (
  id: number,
  payload: UpdateTransactionPayload
) => {
  const response = await httpClient.put<ApiResponse<Transaction>>(
    `/transactions/${id}`,
    payload
  );
  return response.data;
};

export const deleteTransaction = async (id: number) => {
  const response = await httpClient.delete<ApiResponse<{ id: number }>>(
    `/transactions/${id}`
  );
  return response.data;
};
