import { ResourceKey } from './resource.keys';
import { Language } from '../enums/language.enums';
import { resourceMessages, type LanguageCode } from './resource.messages';
import { fieldLabelKeys } from './resource.fields';

const defaultLanguage: LanguageCode = Language.EN_US;

/** @summary Translate a resource key to a localized string. */
export const translateResource = (key: ResourceKey, lang?: LanguageCode | string): string => {
    const language =
        typeof lang === "string" && lang in resourceMessages
            ? (lang as LanguageCode)
            : defaultLanguage;
    return resourceMessages[language][key] || resourceMessages[defaultLanguage][key];
};

/** @summary Translate a field name into a localized label when available. */
export const translateFieldLabel = (field: string, lang?: LanguageCode | string): string => {
    const labelKey = fieldLabelKeys[field];
    return labelKey ? translateResource(labelKey, lang) : field;
};

/** @summary Translate a resource key and interpolate named params. */
export const translateResourceWithParams = (
    key: ResourceKey,
    lang?: LanguageCode | string,
    params?: Record<string, string | number | undefined>
): string => {
    let value = translateResource(key, lang);
    if (!params) return value;
    const resolvedParams: Record<string, string | number | undefined> = { ...params };
    if (typeof resolvedParams.path === 'string') {
        resolvedParams.path = translateFieldLabel(resolvedParams.path, lang);
    }
    if (typeof resolvedParams.field === 'string') {
        resolvedParams.field = translateFieldLabel(resolvedParams.field, lang);
    }
    return value.replace(/\{(\w+)\}/g, (match, name) => {
        const replacement = resolvedParams[name];
        return replacement === undefined ? match : String(replacement);
    });
};
