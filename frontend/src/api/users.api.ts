import type { ApiResponse } from "./api.types";
import type { User } from "./auth.types";
import type { AvatarUploadResponse, UpdateUserPayload } from "./users.types";
import { httpClient } from "./httpClient";

export const getUserById = async (id: number) => {
  const response = await httpClient.get<ApiResponse<User>>(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id: number, payload: UpdateUserPayload) => {
  const response = await httpClient.put<ApiResponse<User>>(
    `/users/${id}`,
    payload
  );
  return response.data;
};

export const uploadUserAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await httpClient.post<ApiResponse<AvatarUploadResponse>>(
    "/users/upload/avatar",
    formData
  );
  return response.data;
};
