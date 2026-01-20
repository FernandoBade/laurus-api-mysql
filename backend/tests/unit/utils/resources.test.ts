import { ResourceKey as Resource } from '../../../../shared/i18n/resource.keys';
import type { LanguageCode } from '../../../../shared/i18n/resourceTypes';
import { translateResource, translateResourceWithParams } from '../../../../shared/i18n/resource.utils';

describe('resource.utils', () => {

    it('returns a value for each supported language', () => {
        const languages: LanguageCode[] = ['en-US', 'pt-BR', 'es-ES'];

        languages.forEach((lang) => {
            const result = translateResource(Resource.VALIDATION_ERROR, lang);
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });
    });

    it('falls back to default language for unknown language codes', () => {
        const fallback = translateResource(Resource.VALIDATION_ERROR, 'en-US');
        const result = translateResource(Resource.VALIDATION_ERROR, 'fr-FR' as LanguageCode);

        expect(result).toBe(fallback);
    });

    it('replaces params in translated messages', () => {
        const result = translateResourceWithParams(Resource.INVALID_TYPE, 'en-US', {
            path: 'amount',
            expected: 'number',
            received: 'text',
        });

        expect(result).toContain('amount');
        expect(result).toContain('number');
        expect(result).toContain('text');
    });
});
