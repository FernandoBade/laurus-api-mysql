import type { ApiResponse } from "@/shared/types/api";
import { apiGet, apiPost, apiPut } from "@/shared/lib/api/client";
import type { AvatarUploadResponse, UpdateUserPayload, User } from "./types";

export const getUserById = (id: number): Promise<ApiResponse<User>> =>
  apiGet<User>(`/users/${id}`);

export const updateUser = (
  id: number,
  payload: UpdateUserPayload
): Promise<ApiResponse<User>> => apiPut<User>(`/users/${id}`, payload);

export const uploadUserAvatar = (
  file: File
): Promise<ApiResponse<AvatarUploadResponse>> => {
  const formData = new FormData();
  formData.append("avatar", file);
  return apiPost<AvatarUploadResponse>("/users/upload/avatar", formData);
};
