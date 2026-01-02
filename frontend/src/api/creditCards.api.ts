import type { ApiListResponse, ApiResponse } from "./api.types";
import type {
  CreateCreditCardPayload,
  CreditCard,
  UpdateCreditCardPayload,
} from "./creditCards.types";
import { httpClient } from "./httpClient";

export const getCreditCards = async (
  params?: Record<string, string | number>
) => {
  const response = await httpClient.get<ApiListResponse<CreditCard>>(
    "/creditCards",
    { params }
  );
  return response.data;
};

export const getCreditCardsByUser = async (
  userId: number,
  params?: Record<string, string | number>
) => {
  const response = await httpClient.get<ApiListResponse<CreditCard>>(
    `/creditCards/user/${userId}`,
    { params }
  );
  return response.data;
};

export const createCreditCard = async (payload: CreateCreditCardPayload) => {
  const response = await httpClient.post<ApiResponse<CreditCard>>(
    "/creditCards",
    payload
  );
  return response.data;
};

export const updateCreditCard = async (
  id: number,
  payload: UpdateCreditCardPayload
) => {
  const response = await httpClient.put<ApiResponse<CreditCard>>(
    `/creditCards/${id}`,
    payload
  );
  return response.data;
};

export const deleteCreditCard = async (id: number) => {
  const response = await httpClient.delete<ApiResponse<{ id: number }>>(
    `/creditCards/${id}`
  );
  return response.data;
};
