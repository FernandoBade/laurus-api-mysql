export type AccountType =
  | "checking"
  | "payroll"
  | "savings"
  | "investment"
  | "loan"
  | "other";

export type CreditCardFlag =
  | "visa"
  | "mastercard"
  | "amex"
  | "elo"
  | "hipercard"
  | "discover"
  | "diners";

export type CategoryType = "income" | "expense";

export type CategoryColor =
  | "red"
  | "blue"
  | "green"
  | "purple"
  | "yellow"
  | "orange"
  | "pink"
  | "gray"
  | "cyan"
  | "indigo";

export type TransactionSource = "account" | "creditCard";

export type TransactionType = "income" | "expense";

export type Theme = "dark" | "light";

export type Language = "en-US" | "es-ES" | "pt-BR";

export type Currency = "ARS" | "COP" | "BRL" | "EUR" | "USD";

export type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY";

export type Profile = "starter" | "pro" | "master";
