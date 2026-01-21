import { ResourceKey } from './resource.keys';

/** @summary Supported resource language code. */
export type LanguageCode = 'pt-BR' | 'en-US' | 'es-ES';

/** @summary Translation map for a single language. */
export type LanguageResource = Record<ResourceKey, string>;

/** @summary Collection of translations by language code. */
export type ResourceCollection = Record<LanguageCode, LanguageResource>;
