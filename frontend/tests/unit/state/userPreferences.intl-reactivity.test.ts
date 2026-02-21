// @vitest-environment jsdom

import { Currency, Language } from "@shared/enums/user.enums";
import { formatDate } from "@/utils/intl/date";
import { formatMoney } from "@/utils/intl/money";
import { formatNumber } from "@/utils/intl/number";
import { makePreferences } from "../../helpers/factories/userPreferences.factory";

const storageGetMock = vi.fn();
const storageSetMock = vi.fn();
const storageRemoveMock = vi.fn();
const getAccessTokenMock = vi.fn();
const subscribeAuthStateMock = vi.fn();
const fetchUserPreferencesMock = vi.fn();

vi.mock("@/platform/storage/storage", () => ({
    storage: {
        get: storageGetMock,
        set: storageSetMock,
        remove: storageRemoveMock,
    },
}));

vi.mock("@/state/auth.store", () => ({
    getAccessToken: getAccessTokenMock,
    subscribeAuthState: subscribeAuthStateMock,
}));

vi.mock("@/services/user/userPreferences.service", () => ({
    fetchUserPreferences: fetchUserPreferencesMock,
}));

type UserPreferencesStoreModule = typeof import("@/state/userPreferences.store");

async function loadStoreModule(): Promise<UserPreferencesStoreModule> {
    return import("@/state/userPreferences.store");
}

function normalizeSpaces(value: string): string {
    return value.replace(/\u00A0/g, " ");
}

describe("userPreferences + intl runtime sanity", () => {
    beforeEach(() => {
        vi.resetModules();
        storageGetMock.mockReset();
        storageSetMock.mockReset();
        storageRemoveMock.mockReset();
        getAccessTokenMock.mockReset();
        subscribeAuthStateMock.mockReset();
        fetchUserPreferencesMock.mockReset();

        storageGetMock.mockReturnValue(
            makePreferences({
                language: Language.EN_US,
                currency: Currency.USD,
            })
        );
        getAccessTokenMock.mockReturnValue(null);
        fetchUserPreferencesMock.mockResolvedValue(null);
        subscribeAuthStateMock.mockImplementation(() => () => undefined);
    });

    it("updates locale and currency formatting without stale values after preference transitions", async () => {
        const store = await loadStoreModule();
        await store.initializeUserPreferencesStore();

        const referenceDate = new Date(Date.UTC(2026, 0, 31, 12, 0, 0));
        const snapshots: string[] = [];

        const unsubscribe = store.subscribeUserPreferences((preferences) => {
            const dateLabel = formatDate(referenceDate, {
                locale: preferences.language,
                options: {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    timeZone: "UTC",
                },
            });
            const numberLabel = formatNumber(2770.11, {
                locale: preferences.language,
                options: {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                },
            });
            const moneyLabel = normalizeSpaces(
                formatMoney("12840.55", {
                    locale: preferences.language,
                    currency: preferences.currency,
                })
            );

            snapshots.push(`${dateLabel}|${numberLabel}|${moneyLabel}`);
        });

        store.setUserPreferences({ language: Language.PT_BR });
        store.setUserPreferences({ currency: Currency.BRL });
        unsubscribe();

        expect(snapshots).toHaveLength(3);

        expect(snapshots[0]).toContain("01/31/2026");
        expect(snapshots[0]).toContain("2,770.11");
        expect(snapshots[0]).toContain("$12,840.55");

        expect(snapshots[1]).toContain("31/01/2026");
        expect(snapshots[1]).toContain("2.770,11");
        expect(snapshots[1]).toContain("12.840,55");

        expect(snapshots[2]).toContain("31/01/2026");
        expect(snapshots[2]).toContain("2.770,11");
        expect(snapshots[2]).toContain("R$ 12.840,55");
    });
});
