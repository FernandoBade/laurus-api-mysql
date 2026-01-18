import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  deleteCategory,
  getCategoriesByUser,
  updateCategory,
} from "./api";
import type {
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "./types";
import type { QueryParams } from "@/shared/types/api";

const categoriesKey = (userId: number | null, params?: QueryParams) => [
  "categories",
  userId,
  params,
];
const categoriesBaseKey = (userId: number | null) => ["categories", userId];

export const useCategoriesByUser = (
  userId: number | null,
  params?: QueryParams
) =>
  useQuery({
    queryKey: categoriesKey(userId, params),
    queryFn: () => getCategoriesByUser(userId as number, params),
    enabled: Boolean(userId),
  });

export const useCreateCategory = (userId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesBaseKey(userId) });
    },
  });
};

export const useUpdateCategory = (userId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateCategoryPayload;
    }) => updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesBaseKey(userId) });
    },
  });
};

export const useDeleteCategory = (userId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesBaseKey(userId) });
    },
  });
};
