import type { CategoryColor, CategoryType } from "./shared.types";

export type Category = {
  id: number;
  name: string | null;
  type: CategoryType;
  color: CategoryColor;
  active: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryPayload = {
  name: string;
  type: CategoryType;
  color?: CategoryColor;
  active?: boolean;
  user_id: number;
};

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;
