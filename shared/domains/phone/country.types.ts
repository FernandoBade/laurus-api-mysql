import { CountryCode } from "../../enums/country.enums";
import { ResourceKey } from "../../i18n/resource.keys";

/** @summary Country metadata used by phone input selectors and E.164 normalization. */
export interface PhoneCountryOption {
    readonly code: CountryCode;
    readonly dialCode: string;
    readonly nameKey: ResourceKey;
    readonly placeholderExample: string;
    readonly maxDigits: number;
}
