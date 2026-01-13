export type Subcategory = {
  id: number;
  name: string | null;
  active: boolean;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateSubcategoryPayload = {
  name: string;
  category_id: number;
  active?: boolean;
};

export type UpdateSubcategoryPayload = Partial<CreateSubcategoryPayload>;
