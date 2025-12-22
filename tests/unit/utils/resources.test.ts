import { ResourceBase } from '../../../src/utils/resources/languages/resourceService';
import { Resource } from '../../../src/utils/resources/resource';
import esES from '../../../src/utils/resources/languages/es-ES';
import { LanguageCode } from '../../../src/utils/resources/resourceTypes';

describe('ResourceBase.translate', () => {
    afterEach(() => {
        ResourceBase.addLanguage('es-ES', esES);
    });

    it('returns a value for each supported language', () => {
        const languages: LanguageCode[] = ['en-US', 'pt-BR', 'es-ES'];

        languages.forEach((lang) => {
            const result = ResourceBase.translate(Resource.VALIDATION_ERROR, lang);
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });
    });

    it('falls back to default language for unknown language codes', () => {
        const fallback = ResourceBase.translate(Resource.VALIDATION_ERROR, 'en-US');
        const result = ResourceBase.translate(Resource.VALIDATION_ERROR, 'fr-FR' as LanguageCode);

        expect(result).toBe(fallback);
    });

    it('falls back to default language when key is missing', () => {
        ResourceBase.addLanguage('es-ES', { [Resource.VALIDATION_ERROR]: 'x' } as any);

        const fallback = ResourceBase.translate(Resource.EMAIL_INVALID, 'en-US');
        const result = ResourceBase.translate(Resource.EMAIL_INVALID, 'es-ES');

        expect(result).toBe(fallback);
    });
});
