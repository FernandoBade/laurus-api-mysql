import enUS from './languages/en-US';
import esES from './languages/es-ES';
import ptBR from './languages/pt-BR';
import { Language } from '../enums/language.enums';
import type { ResourceCollection } from './resourceTypes';

/** @summary Localized resource messages by language. */
export const resourceMessages: ResourceCollection = {
    [Language.EN_US]: enUS,
    [Language.PT_BR]: ptBR,
    [Language.ES_ES]: esES,
};

export type { LanguageCode, LanguageResource, ResourceCollection } from './resourceTypes';
