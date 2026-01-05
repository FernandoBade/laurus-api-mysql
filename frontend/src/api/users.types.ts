import type {
  Currency,
  DateFormat,
  Language,
  Profile,
  Theme,
} from "./shared.types";

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
