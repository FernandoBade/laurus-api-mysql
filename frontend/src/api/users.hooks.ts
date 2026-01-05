import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "./api.types";
import type { User } from "./auth.types";
import { getUserById, updateUser, uploadUserAvatar } from "./users.api";
import type { UpdateUserPayload } from "./users.types";

const userKey = (userId: number | null) => ["user", userId];

export const useUser = (userId: number | null) =>
  useQuery({
    queryKey: userKey(userId),
    queryFn: () => getUserById(userId as number),
    enabled: Boolean(userId),
  });

export const useUpdateUser = (userId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateUserPayload;
    }) => updateUser(id, payload),
    onSuccess: (data) => {
      if (userId) {
        queryClient.setQueryData(userKey(userId), data);
      }
    },
  });
};

export const useUploadAvatar = (userId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadUserAvatar(file),
    onSuccess: (data) => {
      if (!userId) {
        return;
      }
      queryClient.setQueryData(
        userKey(userId),
        (current: ApiResponse<User> | undefined) => {
          if (!current?.data) {
            return current;
          }
          const rawUrl = data.data?.url ?? current.data.avatarUrl;
          const baseUrl = rawUrl ? rawUrl.split("?")[0] : "";
          const url = baseUrl ? `${baseUrl}?v=${Date.now()}` : baseUrl;
          return {
            ...current,
            data: {
              ...current.data,
              avatarUrl: url,
            },
          };
        }
      );
    },
  });
};
