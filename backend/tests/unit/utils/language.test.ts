import { Language } from '../../../../shared/enums/language.enums';
import { resolveRequestLanguage } from '../../../src/utils/language';

describe('resolveRequestLanguage', () => {
    it('returns pt-BR when header is missing', () => {
        expect(resolveRequestLanguage(undefined)).toBe(Language.PT_BR);
    });

    it('resolves exact supported values', () => {
        expect(resolveRequestLanguage('en-US')).toBe(Language.EN_US);
        expect(resolveRequestLanguage('es-ES')).toBe(Language.ES_ES);
        expect(resolveRequestLanguage('pt-BR')).toBe(Language.PT_BR);
    });

    it('resolves by quality order for weighted headers', () => {
        expect(resolveRequestLanguage('en-US;q=0.4, pt-BR;q=0.9')).toBe(Language.PT_BR);
        expect(resolveRequestLanguage('pt-BR,pt;q=0.9,en-US;q=0.8')).toBe(Language.PT_BR);
    });

    it('resolves primary subtags to supported locales', () => {
        expect(resolveRequestLanguage('pt-PT')).toBe(Language.PT_BR);
        expect(resolveRequestLanguage('en;q=0.7')).toBe(Language.EN_US);
        expect(resolveRequestLanguage('es-MX;q=0.8,en-US;q=0.7')).toBe(Language.ES_ES);
    });

    it('falls back to pt-BR for unsupported or zero-quality values', () => {
        expect(resolveRequestLanguage('fr-FR,de-DE')).toBe(Language.PT_BR);
        expect(resolveRequestLanguage('en-US;q=0,fr-FR;q=0.5')).toBe(Language.PT_BR);
        expect(resolveRequestLanguage('*;q=0.4')).toBe(Language.PT_BR);
    });

    it('falls back to pt-BR for malformed Accept-Language headers', () => {
        expect(resolveRequestLanguage(';;;,q==abc')).toBe(Language.PT_BR);
        expect(resolveRequestLanguage(',, ,')).toBe(Language.PT_BR);
    });

    it('supports array header values', () => {
        expect(resolveRequestLanguage(['en-US;q=0.2', 'pt-BR;q=0.9'])).toBe(Language.PT_BR);
    });
});
