import { ResourceKey } from './resource.keys';
import { resourceMessages, type LanguageCode } from './resource.messages';

const DEFAULT_LANGUAGE: LanguageCode = 'en-US';

export const translateResource = (key: ResourceKey, lang?: LanguageCode): string => {
    const language = lang && resourceMessages[lang] ? lang : DEFAULT_LANGUAGE;
    return resourceMessages[language][key] || resourceMessages[DEFAULT_LANGUAGE][key];
};

export const translateResourceWithParams = (
    key: ResourceKey,
    lang?: LanguageCode,
    params?: Record<string, string | number | undefined>
): string => {
    let value = translateResource(key, lang);
    if (!params) return value;
    return value.replace(/\{(\w+)\}/g, (match, name) => {
        const replacement = params[name];
        return replacement === undefined ? match : String(replacement);
    });
};
