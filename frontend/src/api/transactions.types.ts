import type { TransactionSource, TransactionType } from "./shared.types";

export type Transaction = {
  id: number;
  value: string;
  date: string;
  transactionType: TransactionType;
  observation: string | null;
  transactionSource: TransactionSource;
  isInstallment: boolean;
  totalMonths: number | null;
  isRecurring: boolean;
  paymentDay: number | null;
  active: boolean;
  accountId: number | null;
  creditCardId: number | null;
  categoryId: number | null;
  subcategoryId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type TransactionGroup = {
  accountId: number;
  transactions: Transaction[] | undefined;
};

export type CreateTransactionPayload = {
  value: number;
  date: string;
  category_id?: number;
  subcategory_id?: number;
  observation?: string;
  transactionType: TransactionType;
  transactionSource: TransactionSource;
  isInstallment: boolean;
  totalMonths?: number;
  isRecurring: boolean;
  paymentDay?: number;
  account_id?: number;
  creditCard_id?: number;
  tags?: number[];
  active?: boolean;
};

export type UpdateTransactionPayload = Partial<CreateTransactionPayload>;
