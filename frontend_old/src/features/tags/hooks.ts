import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTag, deleteTag, getTagsByUser, updateTag } from "./api";
import type { CreateTagPayload, UpdateTagPayload } from "./types";
import type { QueryParams } from "@/shared/types/api";

const tagsKey = (userId: number | null, params?: QueryParams) => [
  "tags",
  userId,
  params,
];
const tagsBaseKey = (userId: number | null) => ["tags", userId];

export const useTagsByUser = (
  userId: number | null,
  params?: QueryParams
) =>
  useQuery({
    queryKey: tagsKey(userId, params),
    queryFn: () => getTagsByUser(userId as number, params),
    enabled: Boolean(userId),
  });

export const useCreateTag = (userId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTagPayload) => createTag(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsBaseKey(userId) });
    },
  });
};

export const useUpdateTag = (userId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateTagPayload;
    }) => updateTag(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsBaseKey(userId) });
    },
  });
};

export const useDeleteTag = (userId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsBaseKey(userId) });
    },
  });
};
