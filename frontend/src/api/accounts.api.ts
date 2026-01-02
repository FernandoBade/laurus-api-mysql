import type { ApiListResponse, ApiResponse } from "./api.types";
import type {
  Account,
  CreateAccountPayload,
  UpdateAccountPayload,
} from "./accounts.types";
import { httpClient } from "./httpClient";

export const getAccounts = async (params?: Record<string, string | number>) => {
  const response = await httpClient.get<ApiListResponse<Account>>("/accounts", {
    params,
  });
  return response.data;
};

export const getAccountsByUser = async (
  userId: number,
  params?: Record<string, string | number>
) => {
  const response = await httpClient.get<ApiListResponse<Account>>(
    `/accounts/user/${userId}`,
    { params }
  );
  return response.data;
};

export const createAccount = async (payload: CreateAccountPayload) => {
  const response = await httpClient.post<ApiResponse<Account>>(
    "/accounts",
    payload
  );
  return response.data;
};

export const updateAccount = async (
  id: number,
  payload: UpdateAccountPayload
) => {
  const response = await httpClient.put<ApiResponse<Account>>(
    `/accounts/${id}`,
    payload
  );
  return response.data;
};

export const deleteAccount = async (id: number) => {
  const response = await httpClient.delete<ApiResponse<{ id: number }>>(
    `/accounts/${id}`
  );
  return response.data;
};
