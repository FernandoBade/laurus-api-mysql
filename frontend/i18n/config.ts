export const resourceSupportedLanguages = ["pt-BR", "en", "es"] as const;

export type ResourceLanguage = (typeof resourceSupportedLanguages)[number];

export const resourceFallbackLanguage: ResourceLanguage = "pt-BR";

export const resourceLanguageStorageKey = "resource.language";

export const resourceNamespaces = [
  "resource-common",
  "resource-layout",
  "resource-auth",
  "resource-dashboard",
  "resource-transactions",
  "resource-accounts",
  "resource-creditCards",
  "resource-categories",
  "resource-tags",
  "resource-profile",
  "resource-pages",
  "resource-ui",
  "resource-forms",
  "resource-tables",
  "resource-charts",
  "resource-calendar",
] as const;

export type ResourceNamespace = (typeof resourceNamespaces)[number];

export const resourceLanguageOptions = [
  { value: "pt-BR", labelKey: "resource.common.language.ptBr" },
  { value: "en", labelKey: "resource.common.language.en" },
  { value: "es", labelKey: "resource.common.language.es" },
] as const;

const normalizeLanguageKey = (value: string) => value.trim().toLowerCase();

export const normalizeResourceLanguage = (
  value: string | null | undefined
): ResourceLanguage | null => {
  if (!value) {
    return null;
  }
  const normalized = normalizeLanguageKey(value);
  if (!normalized) {
    return null;
  }
  if (normalized === "pt" || normalized.startsWith("pt-")) {
    return "pt-BR";
  }
  if (normalized === "en" || normalized.startsWith("en-")) {
    return "en";
  }
  if (normalized === "es" || normalized.startsWith("es-")) {
    return "es";
  }
  const exactMatch = resourceSupportedLanguages.find(
    (language) => normalizeLanguageKey(language) === normalized
  );
  return exactMatch ?? null;
};

export const resolveStoredResourceLanguage = (): ResourceLanguage | null => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const stored = window.localStorage.getItem(resourceLanguageStorageKey);
    return normalizeResourceLanguage(stored);
  } catch {
    return null;
  }
};

export const resolveBrowserResourceLanguage = (): ResourceLanguage | null => {
  if (typeof navigator === "undefined") {
    return null;
  }
  const candidates = [navigator.language, ...(navigator.languages ?? [])].filter(
    Boolean
  );
  for (const candidate of candidates) {
    const normalized = normalizeResourceLanguage(candidate);
    if (normalized) {
      return normalized;
    }
  }
  return null;
};

export const resolveResourceLanguage = (): ResourceLanguage => {
  return (
    resolveStoredResourceLanguage() ||
    resolveBrowserResourceLanguage() ||
    resourceFallbackLanguage
  );
};

export const persistResourceLanguage = (language: string) => {
  const normalized = normalizeResourceLanguage(language);
  if (!normalized || typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(resourceLanguageStorageKey, normalized);
  } catch {
    // Ignore storage failures.
  }
};
