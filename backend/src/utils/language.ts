import { Language } from '../../../shared/enums/language.enums';

const LANGUAGE_BY_TAG: Record<string, Language> = {
    [Language.EN_US.toLowerCase()]: Language.EN_US,
    [Language.ES_ES.toLowerCase()]: Language.ES_ES,
    [Language.PT_BR.toLowerCase()]: Language.PT_BR,
};

const LANGUAGE_BY_PRIMARY_SUBTAG: Record<string, Language> = {
    en: Language.EN_US,
    es: Language.ES_ES,
    pt: Language.PT_BR,
};

const DEFAULT_LANGUAGE = Language.PT_BR;

interface ParsedLanguageRange {
    tag: string;
    quality: number;
    position: number;
}

/**
 * @summary Parses q-factor values and clamps them to the valid Accept-Language quality range.
 */
function parseQuality(value: string): number {
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed)) {
        return 0;
    }
    if (parsed < 0) {
        return 0;
    }
    if (parsed > 1) {
        return 1;
    }
    return parsed;
}

/**
 * @summary Parses a single Accept-Language range entry into normalized tag and quality metadata.
 */
function parseLanguageRange(range: string, position: number): ParsedLanguageRange | null {
    const trimmed = range.trim();
    if (!trimmed) {
        return null;
    }

    const [rawTag, ...params] = trimmed.split(';');
    const tag = rawTag.trim().toLowerCase();
    if (!tag) {
        return null;
    }

    let quality = 1;
    for (const param of params) {
        const normalized = param.trim().toLowerCase();
        if (!normalized.startsWith('q=')) {
            continue;
        }
        quality = parseQuality(normalized.slice(2));
        break;
    }

    return {
        tag,
        quality,
        position,
    };
}

/**
 * @summary Parses and sorts Accept-Language ranges by quality and declaration order.
 */
function parseAcceptLanguage(value: string): ParsedLanguageRange[] {
    return value
        .split(',')
        .map((range, index) => parseLanguageRange(range, index))
        .filter((range): range is ParsedLanguageRange => range !== null)
        .sort((left, right) => {
            if (left.quality === right.quality) {
                return left.position - right.position;
            }
            return right.quality - left.quality;
        });
}

/**
 * @summary Resolves a requested language tag to a supported application locale.
 */
function resolveSupportedLanguage(tag: string): Language | null {
    if (tag === '*') {
        return DEFAULT_LANGUAGE;
    }

    const exactMatch = LANGUAGE_BY_TAG[tag];
    if (exactMatch) {
        return exactMatch;
    }

    const primarySubtag = tag.split('-')[0];
    return LANGUAGE_BY_PRIMARY_SUBTAG[primarySubtag] ?? null;
}

/**
 * @summary Resolves a supported language from an Accept-Language header.
 * @param headerValue Raw Accept-Language header value.
 * @returns Supported language or deterministic fallback.
 */
export function resolveRequestLanguage(headerValue: string | string[] | undefined): Language {
    if (!headerValue) {
        return DEFAULT_LANGUAGE;
    }

    const rawHeader = Array.isArray(headerValue) ? headerValue.join(',') : headerValue;
    const parsedRanges = parseAcceptLanguage(rawHeader);

    for (const range of parsedRanges) {
        if (range.quality <= 0) {
            continue;
        }

        const resolved = resolveSupportedLanguage(range.tag);
        if (resolved) {
            return resolved;
        }
    }

    return DEFAULT_LANGUAGE;
}
