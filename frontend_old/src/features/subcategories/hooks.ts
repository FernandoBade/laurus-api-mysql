import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSubcategory,
  deleteSubcategory,
  getSubcategoriesByCategory,
  getSubcategoriesByUser,
  updateSubcategory,
} from "./api";
import type {
  CreateSubcategoryPayload,
  UpdateSubcategoryPayload,
} from "./types";
import type { QueryParams } from "@/shared/types/api";

const subcategoriesKey = (
  userId: number | null,
  params?: QueryParams
) => ["subcategories", userId, params];
const subcategoriesBaseKey = (userId: number | null) => ["subcategories", userId];
const subcategoriesByCategoryKey = (
  categoryId: number | null,
  params?: QueryParams
) => ["subcategories", "category", categoryId, params];

export const useSubcategoriesByUser = (
  userId: number | null,
  params?: QueryParams
) =>
  useQuery({
    queryKey: subcategoriesKey(userId, params),
    queryFn: () => getSubcategoriesByUser(userId as number, params),
    enabled: Boolean(userId),
  });

export const useSubcategoriesByCategory = (
  categoryId: number | null,
  params?: QueryParams
) =>
  useQuery({
    queryKey: subcategoriesByCategoryKey(categoryId, params),
    queryFn: () => getSubcategoriesByCategory(categoryId as number, params),
    enabled: Boolean(categoryId),
  });

export const useCreateSubcategory = (userId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSubcategoryPayload) => createSubcategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subcategoriesBaseKey(userId) });
    },
  });
};

export const useUpdateSubcategory = (userId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateSubcategoryPayload;
    }) => updateSubcategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subcategoriesBaseKey(userId) });
    },
  });
};

export const useDeleteSubcategory = (userId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSubcategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subcategoriesBaseKey(userId) });
    },
  });
};
