"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceBase = void 0;
const en_US_1 = __importDefault(require("../languages/en-US"));
const pt_BR_1 = __importDefault(require("../languages/pt-BR"));
const es_ES_1 = __importDefault(require("../languages/es-ES"));
/**
 * Centralized multilingual support service.
 */
class ResourceService {
    constructor() {
        this.resources = {
            'en-US': en_US_1.default,
            'pt-BR': pt_BR_1.default,
            'es-ES': es_ES_1.default,
        };
        this.defaultLanguage = 'en-US';
    }
    /**
     * Retrieves translation safely.
     *
     * @param key - ResourceKey enum
     * @param lang - Optional language code from user
     * @returns Translated string or fallback to English.
     */
    translate(key, lang) {
        const language = lang && this.resources[lang] ? lang : this.defaultLanguage;
        return this.resources[language][key] || this.resources[this.defaultLanguage][key];
    }
    /**
     * Adds support for a new language dynamically.
     *
     * @param lang - Language code (e.g., 'fr-FR')
     * @param resource - Language dictionary with all required keys.
     */
    addLanguage(lang, resource) {
        this.resources[lang] = resource;
    }
}
exports.ResourceBase = new ResourceService();
