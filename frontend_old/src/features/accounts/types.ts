import type { AccountType } from "@/shared/types/domain";

export type Account = {
  id: number;
  name: string | null;
  institution: string | null;
  type: AccountType;
  observation: string | null;
  balance: string;
  active: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateAccountPayload = {
  name: string;
  institution: string;
  type: AccountType;
  observation?: string;
  balance?: number;
  userId: number;
  active?: boolean;
};

export type UpdateAccountPayload = Partial<CreateAccountPayload>;
