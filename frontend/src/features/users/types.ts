import type {
    Currency,
    DateFormat,
    Language,
    Profile,
    Theme,
} from "@/shared/types/domain";
import type { ResourceLanguage } from "@/shared/i18n";

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

export type ProfileSection = "account" | "preferences";

export type ProfileFormState = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate: string;
    theme: Theme;
    language: ResourceLanguage;
    dateFormat: DateFormat;
    currency: Currency;
    hideValues: boolean;
};
