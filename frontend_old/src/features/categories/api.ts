import type { ApiListResponse, ApiResponse, QueryParams } from "@/shared/types/api";
import { apiDelete, apiGet, apiPost, apiPut } from "@/shared/lib/api/client";
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "./types";

export const getCategories = (
  params?: QueryParams
): Promise<ApiListResponse<Category>> =>
  apiGet<Category[], ApiListResponse<Category>>("/categories", params);

export const getCategoriesByUser = (
  userId: number,
  params?: QueryParams
): Promise<ApiListResponse<Category>> =>
  apiGet<Category[], ApiListResponse<Category>>(
    `/categories/user/${userId}`,
    params
  );

export const createCategory = (
  payload: CreateCategoryPayload
): Promise<ApiResponse<Category>> => apiPost<Category>("/categories", payload);

export const updateCategory = (
  id: number,
  payload: UpdateCategoryPayload
): Promise<ApiResponse<Category>> => apiPut<Category>(`/categories/${id}`, payload);

export const deleteCategory = (
  id: number
): Promise<ApiResponse<{ id: number }>> =>
  apiDelete<{ id: number }>(`/categories/${id}`);
