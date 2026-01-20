import { ResourceKey } from './resource.keys';

export type LanguageCode = 'pt-BR' | 'en-US' | 'es-ES';

export type LanguageResource = Record<ResourceKey, string>;
export type ResourceCollection = Record<LanguageCode, LanguageResource>;
