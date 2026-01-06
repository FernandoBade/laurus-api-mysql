import type { ApiListResponse, ApiResponse, QueryParams } from "@/shared/types/api";
import { apiDelete, apiGet, apiPost, apiPut } from "@/shared/lib/api/client";
import type { CreateTagPayload, Tag, UpdateTagPayload } from "./types";

export const getTags = (params?: QueryParams): Promise<ApiListResponse<Tag>> =>
  apiGet<Tag[], ApiListResponse<Tag>>("/tags", params);

export const getTagsByUser = (
  userId: number,
  params?: QueryParams
): Promise<ApiListResponse<Tag>> =>
  apiGet<Tag[], ApiListResponse<Tag>>(`/tags/user/${userId}`, params);

export const createTag = (
  payload: CreateTagPayload
): Promise<ApiResponse<Tag>> => apiPost<Tag>("/tags", payload);

export const updateTag = (
  id: number,
  payload: UpdateTagPayload
): Promise<ApiResponse<Tag>> => apiPut<Tag>(`/tags/${id}`, payload);

export const deleteTag = (id: number): Promise<ApiResponse<{ id: number }>> =>
  apiDelete<{ id: number }>(`/tags/${id}`);
