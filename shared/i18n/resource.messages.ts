import enUS from './languages/en-US';
import esES from './languages/es-ES';
import ptBR from './languages/pt-BR';
import type { ResourceCollection } from './resourceTypes';

export const resourceMessages: ResourceCollection = {
    'en-US': enUS,
    'pt-BR': ptBR,
    'es-ES': esES,
};

export type { LanguageCode, LanguageResource, ResourceCollection } from './resourceTypes';
