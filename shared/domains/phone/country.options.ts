import { CountryCode } from "../../enums/country.enums";
import { ResourceKey } from "../../i18n/resource.keys";
import type { PhoneCountryOption } from "./country.types";

/** @summary Canonical phone country selector options consumed by frontend and backend contracts. */
export const PHONE_COUNTRY_OPTIONS: readonly PhoneCountryOption[] = [
    { code: CountryCode.BR, dialCode: "55", nameKey: ResourceKey.COUNTRY_NAME_BR, placeholderExample: "(11) 91234-5678", maxDigits: 11 },
    { code: CountryCode.US, dialCode: "1", nameKey: ResourceKey.COUNTRY_NAME_US, placeholderExample: "(201) 555-0123", maxDigits: 10 },
    { code: CountryCode.CA, dialCode: "1", nameKey: ResourceKey.COUNTRY_NAME_CA, placeholderExample: "(416) 555-0199", maxDigits: 10 },
    { code: CountryCode.MX, dialCode: "52", nameKey: ResourceKey.COUNTRY_NAME_MX, placeholderExample: "55 1234 5678", maxDigits: 10 },
    { code: CountryCode.AR, dialCode: "54", nameKey: ResourceKey.COUNTRY_NAME_AR, placeholderExample: "11 1234-5678", maxDigits: 10 },
    { code: CountryCode.CL, dialCode: "56", nameKey: ResourceKey.COUNTRY_NAME_CL, placeholderExample: "9 1234 5678", maxDigits: 9 },
    { code: CountryCode.CO, dialCode: "57", nameKey: ResourceKey.COUNTRY_NAME_CO, placeholderExample: "300 1234567", maxDigits: 10 },
    { code: CountryCode.PT, dialCode: "351", nameKey: ResourceKey.COUNTRY_NAME_PT, placeholderExample: "912 345 678", maxDigits: 9 },
    { code: CountryCode.ES, dialCode: "34", nameKey: ResourceKey.COUNTRY_NAME_ES, placeholderExample: "612 34 56 78", maxDigits: 9 },
    { code: CountryCode.FR, dialCode: "33", nameKey: ResourceKey.COUNTRY_NAME_FR, placeholderExample: "06 12 34 56 78", maxDigits: 10 },
    { code: CountryCode.DE, dialCode: "49", nameKey: ResourceKey.COUNTRY_NAME_DE, placeholderExample: "01512 3456789", maxDigits: 11 },
    { code: CountryCode.GB, dialCode: "44", nameKey: ResourceKey.COUNTRY_NAME_GB, placeholderExample: "07400 123456", maxDigits: 11 },
];
