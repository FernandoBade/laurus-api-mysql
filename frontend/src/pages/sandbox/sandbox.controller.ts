import { FilterFieldType } from "@shared/enums/filter.enums";
import { IconName } from "@shared/enums/icon.enums";
import { InputType } from "@shared/enums/input.enums";
import { Theme } from "@shared/enums/theme.enums";
import { ModalPosition, ModalScrollMode, ModalSize, ToastVariant } from "@shared/enums/ui.enums";
import { ResourceKey } from "@shared/i18n/resource.keys";
import type { FieldConfig } from "@/components/filter-bar/filter-bar.types";
import type { TableColumn } from "@/components/table/table.types";
import { getTheme, setTheme } from "@/state/theme.store";
import { clearToasts, pushToast } from "@/state/toast.store";

const SANDBOX_STATUS_VALUE = {
    ALL: "all",
    ACTIVE: "active",
    INACTIVE: "inactive",
} as const;

type SandboxStatusValue = (typeof SANDBOX_STATUS_VALUE)[keyof typeof SANDBOX_STATUS_VALUE];

const USER_STATUS_BY_ID: Record<string, SandboxStatusValue> = {
    usr_01: SANDBOX_STATUS_VALUE.ACTIVE,
    usr_02: SANDBOX_STATUS_VALUE.INACTIVE,
    usr_03: SANDBOX_STATUS_VALUE.ACTIVE,
    usr_04: SANDBOX_STATUS_VALUE.ACTIVE,
    usr_05: SANDBOX_STATUS_VALUE.INACTIVE,
    usr_06: SANDBOX_STATUS_VALUE.ACTIVE,
};

const TOAST_MESSAGE_BY_VARIANT: Record<ToastVariant, ResourceKey> = {
    [ToastVariant.INFO]: ResourceKey.FIELD_LABEL_MESSAGE,
    [ToastVariant.SUCCESS]: ResourceKey.PASSWORD_RESET_SUCCESS,
    [ToastVariant.WARNING]: ResourceKey.PASSWORD_RESET_WARNING,
    [ToastVariant.ERROR]: ResourceKey.UNEXPECTED_ERROR,
};

const TOAST_ICON_BY_VARIANT: Record<ToastVariant, IconName> = {
    [ToastVariant.INFO]: IconName.INFO,
    [ToastVariant.SUCCESS]: IconName.CHECK,
    [ToastVariant.WARNING]: IconName.WARNING,
    [ToastVariant.ERROR]: IconName.ERROR,
};

const DEFAULT_MODAL_STATE: SandboxModalState = {
    open: false,
    size: ModalSize.MD,
    position: ModalPosition.CENTER,
    scrollMode: ModalScrollMode.INSIDE,
};

const DEFAULT_FILTERS: SandboxFilters = {
    search: "",
    status: SANDBOX_STATUS_VALUE.ALL,
};

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const SANDBOX_USERS: readonly SandboxUser[] = [
    { id: "usr_01", name: "Ada Lovelace", email: "ada@laurus.dev", totalMonths: 12, balance: 4820.42 },
    { id: "usr_02", name: "Grace Hopper", email: "grace@laurus.dev", totalMonths: 8, balance: 1570.0 },
    { id: "usr_03", name: "Linus Torvalds", email: "linus@laurus.dev", totalMonths: 24, balance: 9875.12 },
    { id: "usr_04", name: "Margaret Hamilton", email: "margaret@laurus.dev", totalMonths: 18, balance: 3240.75 },
    { id: "usr_05", name: "Alan Turing", email: "alan@laurus.dev", totalMonths: 6, balance: 640.5 },
    { id: "usr_06", name: "Katherine Johnson", email: "katherine@laurus.dev", totalMonths: 36, balance: 12040.88 },
];

const SANDBOX_FILTER_FIELDS: readonly FieldConfig<SandboxFilters>[] = [
    {
        type: FilterFieldType.TEXT,
        name: "search",
        label: ResourceKey.FIELD_LABEL_NAME,
        placeholder: ResourceKey.FIELD_LABEL_NAME,
        icon: IconName.SEARCH,
        inputType: InputType.SEARCH,
        parse: (rawValue) => rawValue,
        serialize: (value) => value ?? "",
    },
    {
        type: FilterFieldType.SELECT,
        name: "status",
        label: ResourceKey.FIELD_LABEL_ACTIVE,
        placeholder: ResourceKey.FIELD_LABEL_TYPE,
        options: [
            { value: SANDBOX_STATUS_VALUE.ALL, label: ResourceKey.FIELD_LABEL_TAGS },
            { value: SANDBOX_STATUS_VALUE.ACTIVE, label: ResourceKey.FIELD_LABEL_ACTIVE },
            { value: SANDBOX_STATUS_VALUE.INACTIVE, label: ResourceKey.FIELD_LABEL_HIDE_VALUES },
        ],
        parse: (rawValue) => rawValue,
        serialize: (value) => value ?? SANDBOX_STATUS_VALUE.ALL,
    },
];

const SANDBOX_USER_COLUMNS: readonly TableColumn<SandboxUser>[] = [
    {
        key: "name",
        header: ResourceKey.FIELD_LABEL_NAME,
        render: (row) => row.name,
    },
    {
        key: "email",
        header: ResourceKey.FIELD_LABEL_EMAIL,
        render: (row) => row.email,
    },
    {
        key: "totalMonths",
        header: ResourceKey.FIELD_LABEL_TOTAL_MONTHS,
        render: (row) => String(row.totalMonths),
        isNumeric: true,
    },
    {
        key: "balance",
        header: ResourceKey.FIELD_LABEL_BALANCE,
        render: (row) => CURRENCY_FORMATTER.format(row.balance),
        isNumeric: true,
    },
];

export const SANDBOX_DATA_TABLE_MODE = {
    READY: "ready",
    LOADING: "loading",
    EMPTY: "empty",
    ERROR: "error",
} as const;

export type SandboxDataTableMode = (typeof SANDBOX_DATA_TABLE_MODE)[keyof typeof SANDBOX_DATA_TABLE_MODE];

export type SandboxFilters = Record<string, string> & {
    readonly search: string;
    readonly status: string;
};

export interface SandboxUser {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly totalMonths: number;
    readonly balance: number;
}

export interface SandboxModalState {
    readonly open: boolean;
    readonly size: ModalSize;
    readonly position: ModalPosition;
    readonly scrollMode: ModalScrollMode;
}

export interface SandboxController {
    readonly getCurrentTheme: () => Theme;
    readonly applyTheme: (theme: Theme) => Theme;
    readonly getDefaultFilters: () => SandboxFilters;
    readonly mergeFilters: (values: Partial<SandboxFilters>) => SandboxFilters;
    readonly getFilterFields: () => readonly FieldConfig<SandboxFilters>[];
    readonly getUsers: () => readonly SandboxUser[];
    readonly getUserColumns: () => readonly TableColumn<SandboxUser>[];
    readonly filterUsers: (values: SandboxFilters) => readonly SandboxUser[];
    readonly getTotalPages: (totalRows: number, pageSize: number) => number;
    readonly paginateUsers: (users: readonly SandboxUser[], page: number, pageSize: number) => readonly SandboxUser[];
    readonly getDefaultModalState: () => SandboxModalState;
    readonly openModal: (state: SandboxModalState, patch: Partial<SandboxModalState>) => SandboxModalState;
    readonly closeModal: (state: SandboxModalState) => SandboxModalState;
    readonly triggerToast: (variant: ToastVariant) => void;
    readonly triggerToastWithIcon: (variant: ToastVariant) => void;
    readonly triggerPersistentToast: (variant: ToastVariant) => void;
    readonly triggerToastBurst: () => void;
    readonly clearAllToasts: () => void;
    readonly resolveDataTableRows: (users: readonly SandboxUser[], mode: SandboxDataTableMode) => readonly SandboxUser[];
}

function resolveUserStatus(userId: string): SandboxStatusValue {
    return USER_STATUS_BY_ID[userId] ?? SANDBOX_STATUS_VALUE.ACTIVE;
}

/**
 * @summary Creates sandbox-only controller actions for local UI validation state.
 * @returns Sandbox page controller.
 */
export function createSandboxController(): SandboxController {
    const getCurrentTheme = (): Theme => getTheme();

    const applyTheme = (theme: Theme): Theme => {
        setTheme(theme);
        return getTheme();
    };

    const getDefaultFilters = (): SandboxFilters => ({ ...DEFAULT_FILTERS });

    const mergeFilters = (values: Partial<SandboxFilters>): SandboxFilters => ({
        search: values.search ?? DEFAULT_FILTERS.search,
        status: values.status ?? DEFAULT_FILTERS.status,
    });

    const getFilterFields = (): readonly FieldConfig<SandboxFilters>[] => SANDBOX_FILTER_FIELDS;

    const getUsers = (): readonly SandboxUser[] => SANDBOX_USERS;

    const getUserColumns = (): readonly TableColumn<SandboxUser>[] => SANDBOX_USER_COLUMNS;

    const filterUsers = (values: SandboxFilters): readonly SandboxUser[] => {
        const searchTerm = values.search.trim().toLowerCase();
        const status = values.status;

        return SANDBOX_USERS.filter((user) => {
            const matchesSearch =
                searchTerm.length === 0
                || user.name.toLowerCase().includes(searchTerm)
                || user.email.toLowerCase().includes(searchTerm);

            if (!matchesSearch) {
                return false;
            }

            if (status === SANDBOX_STATUS_VALUE.ALL) {
                return true;
            }

            return resolveUserStatus(user.id) === status;
        });
    };

    const getTotalPages = (totalRows: number, pageSize: number): number => {
        if (pageSize <= 0) {
            return 1;
        }

        return Math.max(1, Math.ceil(totalRows / pageSize));
    };

    const paginateUsers = (users: readonly SandboxUser[], page: number, pageSize: number): readonly SandboxUser[] => {
        if (pageSize <= 0) {
            return users;
        }

        const safePage = Math.max(1, page);
        const start = (safePage - 1) * pageSize;
        return users.slice(start, start + pageSize);
    };

    const getDefaultModalState = (): SandboxModalState => ({ ...DEFAULT_MODAL_STATE });

    const openModal = (state: SandboxModalState, patch: Partial<SandboxModalState>): SandboxModalState => ({
        ...state,
        ...patch,
        open: true,
    });

    const closeModal = (state: SandboxModalState): SandboxModalState => ({
        ...state,
        open: false,
    });

    const triggerToast = (variant: ToastVariant): void => {
        pushToast({
            variant,
            message: TOAST_MESSAGE_BY_VARIANT[variant],
        });
    };

    const triggerToastWithIcon = (variant: ToastVariant): void => {
        pushToast({
            variant,
            message: TOAST_MESSAGE_BY_VARIANT[variant],
            icon: TOAST_ICON_BY_VARIANT[variant],
        });
    };

    const triggerPersistentToast = (variant: ToastVariant): void => {
        pushToast({
            variant,
            message: TOAST_MESSAGE_BY_VARIANT[variant],
            durationMs: 0,
        });
    };

    const triggerToastBurst = (): void => {
        pushToast({
            variant: ToastVariant.INFO,
            message: TOAST_MESSAGE_BY_VARIANT[ToastVariant.INFO],
        });
        pushToast({
            variant: ToastVariant.SUCCESS,
            message: TOAST_MESSAGE_BY_VARIANT[ToastVariant.SUCCESS],
        });
        pushToast({
            variant: ToastVariant.WARNING,
            message: TOAST_MESSAGE_BY_VARIANT[ToastVariant.WARNING],
        });
    };

    const clearAllToasts = (): void => {
        clearToasts();
    };

    const resolveDataTableRows = (users: readonly SandboxUser[], mode: SandboxDataTableMode): readonly SandboxUser[] => {
        if (mode === SANDBOX_DATA_TABLE_MODE.EMPTY) {
            return [];
        }

        return users;
    };

    return {
        getCurrentTheme,
        applyTheme,
        getDefaultFilters,
        mergeFilters,
        getFilterFields,
        getUsers,
        getUserColumns,
        filterUsers,
        getTotalPages,
        paginateUsers,
        getDefaultModalState,
        openModal,
        closeModal,
        triggerToast,
        triggerToastWithIcon,
        triggerPersistentToast,
        triggerToastBurst,
        clearAllToasts,
        resolveDataTableRows,
    };
}
