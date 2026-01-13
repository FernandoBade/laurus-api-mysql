import type { ApiListResponse, ApiResponse, QueryParams } from "@/shared/types/api";
import { apiDelete, apiGet, apiPost, apiPut } from "@/shared/lib/api/client";
import type {
  CreateSubcategoryPayload,
  Subcategory,
  UpdateSubcategoryPayload,
} from "./types";

export const getSubcategoriesByUser = (
  userId: number,
  params?: QueryParams
): Promise<ApiListResponse<Subcategory>> =>
  apiGet<Subcategory[], ApiListResponse<Subcategory>>(
    `/subcategories/user/${userId}`,
    params
  );

export const getSubcategoriesByCategory = (
  categoryId: number,
  params?: QueryParams
): Promise<ApiListResponse<Subcategory>> =>
  apiGet<Subcategory[], ApiListResponse<Subcategory>>(
    `/subcategories/category/${categoryId}`,
    params
  );

export const createSubcategory = (
  payload: CreateSubcategoryPayload
): Promise<ApiResponse<Subcategory>> =>
  apiPost<Subcategory>("/subcategories", payload);

export const updateSubcategory = (
  id: number,
  payload: UpdateSubcategoryPayload
): Promise<ApiResponse<Subcategory>> =>
  apiPut<Subcategory>(`/subcategories/${id}`, payload);

export const deleteSubcategory = (
  id: number
): Promise<ApiResponse<{ id: number }>> =>
  apiDelete<{ id: number }>(`/subcategories/${id}`);
