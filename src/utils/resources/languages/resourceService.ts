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
     * @param key - ResourceKey enum
     * @param lang - Optional language code from user
     * @returns Translated string or fallback to English.
     */
    public translate(key: Resource, lang?: LanguageCode): string {
        const language = lang && this.resources[lang] ? lang : this.defaultLanguage;
        return this.resources[language][key] || this.resources[this.defaultLanguage][key];
    }

    /**
     * Adds support for a new language dynamically.
     * @param lang - Language code (e.g., 'fr-FR')
     * @param resource - Language dictionary with all required keys.
     */
    public addLanguage(lang: LanguageCode, resource: LanguageResource): void {
        this.resources[lang] = resource;
    }
}

export const ResourceBase = new ResourceService();
