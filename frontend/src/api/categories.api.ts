import type { ApiListResponse, ApiResponse } from "./api.types";
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "./categories.types";
import { httpClient } from "./httpClient";

export const getCategories = async (
  params?: Record<string, string | number>
) => {
  const response = await httpClient.get<ApiListResponse<Category>>(
    "/categories",
    { params }
  );
  return response.data;
};

export const getCategoriesByUser = async (
  userId: number,
  params?: Record<string, string | number>
) => {
  const response = await httpClient.get<ApiListResponse<Category>>(
    `/categories/user/${userId}`,
    { params }
  );
  return response.data;
};

export const createCategory = async (payload: CreateCategoryPayload) => {
  const response = await httpClient.post<ApiResponse<Category>>(
    "/categories",
    payload
  );
  return response.data;
};

export const updateCategory = async (
  id: number,
  payload: UpdateCategoryPayload
) => {
  const response = await httpClient.put<ApiResponse<Category>>(
    `/categories/${id}`,
    payload
  );
  return response.data;
};

export const deleteCategory = async (id: number) => {
  const response = await httpClient.delete<ApiResponse<{ id: number }>>(
    `/categories/${id}`
  );
  return response.data;
};
