import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCreditCard,
  deleteCreditCard,
  getCreditCardsByUser,
  updateCreditCard,
} from "./creditCards.api";
import type {
  CreateCreditCardPayload,
  UpdateCreditCardPayload,
} from "./creditCards.types";

const creditCardsKey = (userId: number | null, params?: Record<string, any>) => [
  "creditCards",
  userId,
  params,
];
const creditCardsBaseKey = (userId: number | null) => [
  "creditCards",
  userId,
];

export const useCreditCardsByUser = (
  userId: number | null,
  params?: Record<string, any>
) =>
  useQuery({
    queryKey: creditCardsKey(userId, params),
    queryFn: () => getCreditCardsByUser(userId as number, params),
    enabled: Boolean(userId),
  });

export const useCreateCreditCard = (userId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCreditCardPayload) => createCreditCard(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditCardsBaseKey(userId) });
    },
  });
};

export const useUpdateCreditCard = (userId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateCreditCardPayload;
    }) => updateCreditCard(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditCardsBaseKey(userId) });
    },
  });
};

export const useDeleteCreditCard = (userId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCreditCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditCardsBaseKey(userId) });
    },
  });
};
