import type {
  Currency,
  DateFormat,
  Language,
  Profile,
  Theme,
} from "@/shared/types/domain";

export type UpdateUserPayload = Partial<{
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string | null;
  birthDate: string | null;
  theme: Theme;
  language: Language;
  currency: Currency;
  dateFormat: DateFormat;
  profile: Profile;
  hideValues: boolean;
  active: boolean;
}>;

export type AvatarUploadResponse = {
  url: string;
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
