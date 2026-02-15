import { ResourceKey } from './resource.keys';
import { Language } from '../enums/language.enums';

/** @summary Supported resource language code. */
export type LanguageCode = Language;

/** @summary Translation map for a single language. */
export type LanguageResource = Record<ResourceKey, string>;

/** @summary Collection of translations by language code. */
export type ResourceCollection = Record<LanguageCode, LanguageResource>;
