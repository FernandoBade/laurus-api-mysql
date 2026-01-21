export type Tag = {
  id: number;
  userId: number;
  name: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateTagPayload = {
  name: string;
  userId: number;
  active?: boolean;
};

export type UpdateTagPayload = Partial<CreateTagPayload>;
