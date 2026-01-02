import type { ApiListResponse, ApiResponse } from "./api.types";
import type { CreateTagPayload, Tag, UpdateTagPayload } from "./tags.types";
import { httpClient } from "./httpClient";

export const getTags = async (params?: Record<string, string | number>) => {
  const response = await httpClient.get<ApiListResponse<Tag>>("/tags", {
    params,
  });
  return response.data;
};

export const getTagsByUser = async (
  userId: number,
  params?: Record<string, string | number>
) => {
  const response = await httpClient.get<ApiListResponse<Tag>>(
    `/tags/user/${userId}`,
    { params }
  );
  return response.data;
};

export const createTag = async (payload: CreateTagPayload) => {
  const response = await httpClient.post<ApiResponse<Tag>>("/tags", payload);
  return response.data;
};

export const updateTag = async (id: number, payload: UpdateTagPayload) => {
  const response = await httpClient.put<ApiResponse<Tag>>(
    `/tags/${id}`,
    payload
  );
  return response.data;
};

export const deleteTag = async (id: number) => {
  const response = await httpClient.delete<ApiResponse<{ id: number }>>(
    `/tags/${id}`
  );
  return response.data;
};
