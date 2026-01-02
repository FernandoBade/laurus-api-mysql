import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  deleteCategory,
  getCategoriesByUser,
  updateCategory,
} from "./categories.api";
import type {
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "./categories.types";

const categoriesKey = (userId: number | null, params?: Record<string, any>) => [
  "categories",
  userId,
  params,
];
const categoriesBaseKey = (userId: number | null) => ["categories", userId];

export const useCategoriesByUser = (
  userId: number | null,
  params?: Record<string, any>
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
