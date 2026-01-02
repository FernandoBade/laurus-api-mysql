import type { CreditCardFlag } from "./shared.types";

export type CreditCard = {
  id: number;
  name: string | null;
  flag: CreditCardFlag;
  observation: string | null;
  balance: string;
  limit: string;
  active: boolean;
  userId: number;
  accountId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCreditCardPayload = {
  name: string;
  flag: CreditCardFlag;
  observation?: string;
  balance?: number;
  limit?: number;
  user_id: number;
  account_id?: number;
  active?: boolean;
};

export type UpdateCreditCardPayload = Partial<CreateCreditCardPayload>;
