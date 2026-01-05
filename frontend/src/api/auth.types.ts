import type {
  Currency,
  DateFormat,
  Language,
  Profile,
  Theme,
} from "./shared.types";

export type AuthTokenResponse = {
  token: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  birthDate?: string;
  theme?: Theme;
  language?: Language;
  currency?: Currency;
  dateFormat?: DateFormat;
  profile?: Profile;
  hideValues?: boolean;
  active?: boolean;
};

export type User = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  birthDate: string | null;
  phone: string | null;
  avatarUrl: string | null;
  theme: Theme;
  language: Language;
  dateFormat: DateFormat;
  currency: Currency;
  profile: Profile;
  hideValues: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};
