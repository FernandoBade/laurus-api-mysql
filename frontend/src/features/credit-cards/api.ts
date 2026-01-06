import type { ApiListResponse, ApiResponse, QueryParams } from "@/shared/types/api";
import { apiDelete, apiGet, apiPost, apiPut } from "@/shared/lib/api/client";
import type {
  CreateCreditCardPayload,
  CreditCard,
  UpdateCreditCardPayload,
} from "./types";

export const getCreditCards = (
  params?: QueryParams
): Promise<ApiListResponse<CreditCard>> =>
  apiGet<CreditCard[], ApiListResponse<CreditCard>>("/creditCards", params);

export const getCreditCardsByUser = (
  userId: number,
  params?: QueryParams
): Promise<ApiListResponse<CreditCard>> =>
  apiGet<CreditCard[], ApiListResponse<CreditCard>>(
    `/creditCards/user/${userId}`,
    params
  );

export const createCreditCard = (
  payload: CreateCreditCardPayload
): Promise<ApiResponse<CreditCard>> =>
  apiPost<CreditCard>("/creditCards", payload);

export const updateCreditCard = (
  id: number,
  payload: UpdateCreditCardPayload
): Promise<ApiResponse<CreditCard>> =>
  apiPut<CreditCard>(`/creditCards/${id}`, payload);

export const deleteCreditCard = (
  id: number
): Promise<ApiResponse<{ id: number }>> =>
  apiDelete<{ id: number }>(`/creditCards/${id}`);
