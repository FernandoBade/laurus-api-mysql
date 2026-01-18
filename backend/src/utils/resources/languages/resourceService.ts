import enUS from '../languages/en-US';
import ptBR from '../languages/pt-BR';
import esES from '../languages/es-ES';
import { Resource } from '../resource';
import { ResourceCollection, LanguageCode, LanguageResource } from '../resourceTypes';

/**
 * Centralized multilingual support service.
 */
class ResourceService {
    private resources: ResourceCollection = {
        'en-US': enUS,
        'pt-BR': ptBR,
        'es-ES': esES,
    };

    private defaultLanguage: LanguageCode = 'en-US';

    /**
     * Retrieves translation safely.
     *
     * @param key - ResourceKey enum
     * @param lang - Optional language code from user
     * @returns Translated string or fallback to English.
     */
    public translate(key: Resource, lang?: LanguageCode): string {
        const language = lang && this.resources[lang] ? lang : this.defaultLanguage;
        return this.resources[language][key] || this.resources[this.defaultLanguage][key];
    }

    /**
     * Retrieves a translated string and replaces template placeholders with provided params.
     * Placeholders follow the `{name}` format and will be replaced when a corresponding key
     * exists in `params`. Unknown placeholders are left as-is.
     *
     * @param key - Resource key
     * @param lang - Language code
     * @param params - Mapping of placeholder names to replacement values
     */
    public translateWithParams(key: Resource, lang?: LanguageCode, params?: Record<string, string | number | undefined>): string {
        let value = this.translate(key, lang);
        if (!params) return value;
        return value.replace(/\{(\w+)\}/g, (_match, name) => {
            const replacement = params[name];
            return replacement === undefined ? _match : String(replacement);
        });
    }

    /**
     * Adds support for a new language dynamically.
     *
     * @param lang - Language code (e.g., 'fr-FR')
     * @param resource - Language dictionary with all required keys.
     */
    public addLanguage(lang: LanguageCode, resource: LanguageResource): void {
        this.resources[lang] = resource;
    }
}

export const ResourceBase = new ResourceService();
