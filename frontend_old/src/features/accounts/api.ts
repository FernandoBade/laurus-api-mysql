import type { ApiListResponse, ApiResponse, QueryParams } from "@/shared/types/api";
import { apiDelete, apiGet, apiPost, apiPut } from "@/shared/lib/api/client";
import type {
  Account,
  CreateAccountPayload,
  UpdateAccountPayload,
} from "./types";

export const getAccounts = (params?: QueryParams): Promise<ApiListResponse<Account>> =>
  apiGet<Account[], ApiListResponse<Account>>("/accounts", params);

export const getAccountsByUser = (
  userId: number,
  params?: QueryParams
): Promise<ApiListResponse<Account>> =>
  apiGet<Account[], ApiListResponse<Account>>(`/accounts/user/${userId}`, params);

export const createAccount = (
  payload: CreateAccountPayload
): Promise<ApiResponse<Account>> => apiPost<Account>("/accounts", payload);

export const updateAccount = (
  id: number,
  payload: UpdateAccountPayload
): Promise<ApiResponse<Account>> => apiPut<Account>(`/accounts/${id}`, payload);

export const deleteAccount = (
  id: number
): Promise<ApiResponse<{ id: number }>> =>
  apiDelete<{ id: number }>(`/accounts/${id}`);
