import type {
  Currency,
  DateFormat,
  Language,
  Profile,
  Theme,
} from "@/shared/types/domain";

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

export type VerifyEmailRequest = {
  token: string;
};

export type VerifyEmailResponse = {
  verified: true;
  alreadyVerified?: boolean;
  email?: string;
};

export type ResendVerificationRequest = {
  email: string;
};

export type ResendVerificationResponse = {
  sent: true;
};
