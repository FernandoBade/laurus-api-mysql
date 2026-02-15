import { ResourceKey as Resource } from '../../../../shared/i18n/resource.keys';
import type { LanguageCode } from '../../../../shared/i18n/resourceTypes';
import { translateResource, translateResourceWithParams } from '../../../../shared/i18n/resource.utils';
import { Language } from '../../../../shared/enums/language.enums';

describe('resource.utils', () => {

    it('returns a value for each supported language', () => {
        const languages: LanguageCode[] = [Language.EN_US, Language.PT_BR, Language.ES_ES];

        languages.forEach((lang) => {
            const result = translateResource(Resource.VALIDATION_ERROR, lang);
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });
    });

    it('falls back to default language for unknown language codes', () => {
        const fallback = translateResource(Resource.VALIDATION_ERROR, Language.EN_US);
        const result = translateResource(Resource.VALIDATION_ERROR, 'fr-FR' as LanguageCode);

        expect(result).toBe(fallback);
    });

    it('replaces params in translated messages', () => {
        const result = translateResourceWithParams(Resource.INVALID_TYPE, Language.EN_US, {
            path: 'amount',
            expected: 'number',
            received: 'text',
        });

        expect(result).toContain('amount');
    });
});
