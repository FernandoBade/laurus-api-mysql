import { Resource } from '../resources/resource';

export type LanguageCode = 'pt-BR' | 'en-US' | 'es-ES';

/**
 * Strongly typed language dictionary, providing type safety for language resources.
 * This type is used to define the structure of language resources in the application.
 * You can add new languages by extending the LanguageCode type and adding the corresponding resources.
 */
export type LanguageResource = {
    [key in Resource]: string;
};

export type ResourceCollection = Record<LanguageCode, LanguageResource>;
