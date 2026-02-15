/**
 * @summary Sandbox page used for UI Core Kit validation. Not a business feature.
 */

import type { JSX } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { IconPosition } from "@shared/enums/icon-position.enums";
import { IconName } from "@shared/enums/icon.enums";
import { InputType } from "@shared/enums/input.enums";
import { Language } from "@shared/enums/language.enums";
import { Theme } from "@shared/enums/theme.enums";
import {
    AlertDirection,
    AlertStyle,
    AlertVariant,
    ButtonSize,
    ButtonVariant,
    LoaderSize,
    ModalPosition,
    ModalScrollMode,
    ModalSize,
    ToastVariant,
    TooltipPosition,
} from "@shared/enums/ui.enums";
import { ResourceKey } from "@shared/i18n/resource.keys";
import type { AccordionItem } from "@/components/accordion/accordion.types";
import { Accordion } from "@/components/accordion/accordion";
import { Alert } from "@/components/alert/alert";
import { Bullets } from "@/components/bullets/bullets";
import { Button } from "@/components/button/button";
import { Card } from "@/components/card/card";
import { DataTable } from "@/components/data-table/data-table";
import { EmptyState } from "@/components/empty-state/empty-state";
import { ErrorState } from "@/components/error-state/error-state";
import { Fieldset } from "@/components/fieldset/fieldset";
import { FilterBar } from "@/components/filter-bar/filter-bar";
import { Form } from "@/components/form/form";
import { FormGrid } from "@/components/form-grid/form-grid";
import { Icon } from "@/components/icon/icon";
import { Input } from "@/components/input/input";
import { Loader } from "@/components/loader/loader";
import { Modal } from "@/components/modal/modal";
import { PageContainer } from "@/components/page-container/page-container";
import { Pagination } from "@/components/pagination/pagination";
import { Select } from "@/components/select/select";
import type { SelectOption } from "@/components/select/select.types";
import { Table } from "@/components/table/table";
import type { TableColumn } from "@/components/table/table.types";
import { ToastContainer } from "@/components/toast/toast";
import { Tooltip } from "@/components/tooltip/tooltip";
import {
    createSandboxController,
    SANDBOX_DATA_TABLE_MODE,
    type SandboxDataTableMode,
    type SandboxFilters,
    type SandboxModalState,
} from "@/pages/sandbox/sandbox.controller";
import { getLocale, setLocale } from "@/state/locale.store";
import { getToasts, removeToast, subscribeToasts } from "@/state/toast.store";

const PAGE_SIZE = 3;
const CANVAS_CLASS = "rounded-3xl border border-base-300 bg-base-300/40 p-4 sm:p-6";
const SECTION_CLASS = "rounded-2xl border border-base-300 bg-base-200 p-4 shadow-sm sm:p-5";
const PALETTE_PANEL_CLASS = "overflow-hidden rounded-xl border border-base-300";
const DEMO_PANEL_CLASS = "rounded-xl border border-base-300 bg-base-100 p-3 shadow-sm";

const THEME_OPTIONS: readonly Theme[] = [Theme.LIGHT, Theme.DARK];
const MODAL_SIZES: readonly ModalSize[] = [ModalSize.SM, ModalSize.MD, ModalSize.LG, ModalSize.XL];
const MODAL_POSITIONS: readonly ModalPosition[] = [ModalPosition.CENTER, ModalPosition.TOP, ModalPosition.BOTTOM];
const MODAL_SCROLL_MODES: readonly ModalScrollMode[] = [ModalScrollMode.INSIDE, ModalScrollMode.BODY];
const TOAST_VARIANTS: readonly ToastVariant[] = [ToastVariant.INFO, ToastVariant.SUCCESS, ToastVariant.WARNING, ToastVariant.ERROR];
const ICONS: readonly IconName[] = [IconName.SEARCH, IconName.USER, IconName.EMAIL, IconName.LOCK, IconName.INFO, IconName.WARNING, IconName.ADD, IconName.EDIT, IconName.SAVE, IconName.DELETE];
const BUTTON_ICON_EXAMPLES: readonly { readonly icon: IconName; readonly variant: ButtonVariant }[] = [
    { icon: IconName.ADD, variant: ButtonVariant.PRIMARY },
    { icon: IconName.EDIT, variant: ButtonVariant.SECONDARY },
    { icon: IconName.SAVE, variant: ButtonVariant.ACCENT },
    { icon: IconName.DELETE, variant: ButtonVariant.OUTLINE },
];

const SELECT_OPTIONS: readonly SelectOption[] = [
    { value: "active", label: ResourceKey.FIELD_LABEL_ACTIVE },
    { value: "inactive", label: ResourceKey.FIELD_LABEL_HIDE_VALUES },
];

const TOAST_BUTTON_VARIANT: Record<ToastVariant, ButtonVariant> = {
    [ToastVariant.INFO]: ButtonVariant.SECONDARY,
    [ToastVariant.SUCCESS]: ButtonVariant.PRIMARY,
    [ToastVariant.WARNING]: ButtonVariant.ACCENT,
    [ToastVariant.ERROR]: ButtonVariant.OUTLINE,
};

const TOAST_LABEL: Record<ToastVariant, string> = {
    [ToastVariant.INFO]: "Info",
    [ToastVariant.SUCCESS]: "Success",
    [ToastVariant.WARNING]: "Warning",
    [ToastVariant.ERROR]: "Error",
};

const MODAL_POSITION_LABEL: Record<ModalPosition, string> = {
    [ModalPosition.CENTER]: "Center",
    [ModalPosition.TOP]: "Top",
    [ModalPosition.BOTTOM]: "Bottom",
};

const MODAL_SCROLL_LABEL: Record<ModalScrollMode, string> = {
    [ModalScrollMode.INSIDE]: "Inside",
    [ModalScrollMode.BODY]: "Body",
};

const DATA_TABLE_MODE_LABEL: Record<SandboxDataTableMode, string> = {
    [SANDBOX_DATA_TABLE_MODE.READY]: "Ready",
    [SANDBOX_DATA_TABLE_MODE.LOADING]: "Loading",
    [SANDBOX_DATA_TABLE_MODE.EMPTY]: "Empty",
    [SANDBOX_DATA_TABLE_MODE.ERROR]: "Error",
};

const TOOLTIP_ITEMS: readonly { readonly label: string; readonly position: TooltipPosition; readonly content: ResourceKey }[] = [
    { label: "Top", position: TooltipPosition.TOP, content: ResourceKey.FIELD_LABEL_TITLE },
    { label: "Right", position: TooltipPosition.RIGHT, content: ResourceKey.FIELD_LABEL_MESSAGE },
    { label: "Bottom", position: TooltipPosition.BOTTOM, content: ResourceKey.FIELD_LABEL_DATE },
    { label: "Left", position: TooltipPosition.LEFT, content: ResourceKey.FIELD_LABEL_NAME },
];

const MODAL_PARAGRAPHS: readonly string[] = [
    "This modal content is intentionally long for scroll-mode validation.",
    "Use the controls to open with each size, position and scroll mode.",
    "Close using backdrop, close icon, Cancel, or Confirm actions.",
    "This page is debug-only and does not call API clients.",
    "Resize viewport to validate mobile-first responsiveness.",
    "Switch theme to inspect color-only differences between modes.",
    "All examples are static and deterministic.",
    "No business workflow depends on this sandbox page.",
];

interface NumericOverviewRow {
    readonly transactionId: string;
    readonly totalMonths: number;
    readonly amount: number;
    readonly balance: number;
}

interface TypographyTokenSample {
    readonly id: string;
    readonly name: string;
    readonly classes: string;
    readonly preview: string;
    readonly description: string;
}

interface TypographyWeightSample {
    readonly id: string;
    readonly label: string;
    readonly classes: string;
    readonly preview: string;
}

const NUMERIC_FORMATTER = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const NUMERIC_OVERVIEW_ROWS: readonly NumericOverviewRow[] = [
    { transactionId: "tx_2026_00041", totalMonths: 12, amount: 245.89, balance: 3920.11 },
    { transactionId: "tx_2026_00042", totalMonths: 6, amount: 1150.0, balance: 2770.11 },
    { transactionId: "tx_2026_00043", totalMonths: 24, amount: 79.5, balance: 2690.61 },
];

const NUMERIC_OVERVIEW_COLUMNS: readonly TableColumn<NumericOverviewRow>[] = [
    {
        key: "transactionId",
        header: ResourceKey.FIELD_LABEL_USER_ID,
        render: (row) => <span class="font-data">{row.transactionId}</span>,
    },
    {
        key: "totalMonths",
        header: ResourceKey.FIELD_LABEL_TOTAL_MONTHS,
        render: (row) => String(row.totalMonths),
        isNumeric: true,
    },
    {
        key: "amount",
        header: ResourceKey.FIELD_LABEL_VALUE,
        render: (row) => NUMERIC_FORMATTER.format(row.amount),
        isNumeric: true,
    },
    {
        key: "balance",
        header: ResourceKey.FIELD_LABEL_BALANCE,
        render: (row) => NUMERIC_FORMATTER.format(row.balance),
        isNumeric: true,
    },
];

const TYPOGRAPHY_TOKEN_SAMPLES: readonly TypographyTokenSample[] = [
    {
        id: "page-title",
        name: "Page Title",
        classes: "text-page-title",
        preview: "Executive Dashboard",
        description: "Primary heading for page-level entry points.",
    },
    {
        id: "section-title",
        name: "Section Title",
        classes: "text-section-title",
        preview: "Portfolio Performance",
        description: "Section grouping and major content separators.",
    },
    {
        id: "card-title",
        name: "Card Title",
        classes: "text-card-title",
        preview: "Revenue Summary",
        description: "Title style used inside cards and compact panels.",
    },
    {
        id: "body",
        name: "Body",
        classes: "text-body",
        preview: "Body copy for descriptions, details, and long-form UI text.",
        description: "Default copy style for standard content.",
    },
    {
        id: "label",
        name: "Label",
        classes: "text-label",
        preview: "Account Status",
        description: "Control labels and short emphasized metadata.",
    },
    {
        id: "caption",
        name: "Caption",
        classes: "text-caption",
        preview: "Last synced 2 minutes ago",
        description: "Secondary helper text and compact annotations.",
    },
    {
        id: "tooltip",
        name: "Tooltip Text",
        classes: "text-tooltip",
        preview: "Hover to view field help",
        description: "Microcopy used by tooltips and dense helper hints.",
    },
    {
        id: "button-sm",
        name: "Button Text Small",
        classes: "text-button-sm",
        preview: "Small Action",
        description: "Text size token for small buttons.",
    },
    {
        id: "button-md",
        name: "Button Text Medium",
        classes: "text-button-md",
        preview: "Medium Action",
        description: "Default text size token for medium buttons.",
    },
    {
        id: "button-lg",
        name: "Button Text Large",
        classes: "text-button-lg",
        preview: "Large Action",
        description: "Text size token for large buttons.",
    },
];

const UI_FONT_WEIGHT_SAMPLES: readonly TypographyWeightSample[] = [
    {
        id: "ui-regular",
        label: "Regular 400",
        classes: "font-ui text-body font-normal",
        preview: "Plus Jakarta Sans regular sample",
    },
    {
        id: "ui-medium",
        label: "Medium 500",
        classes: "font-ui text-body font-medium",
        preview: "Plus Jakarta Sans medium sample",
    },
    {
        id: "ui-semibold",
        label: "Semibold 600",
        classes: "font-ui text-body font-semibold",
        preview: "Plus Jakarta Sans semibold sample",
    },
    {
        id: "ui-bold",
        label: "Bold 700",
        classes: "font-ui text-body font-bold",
        preview: "Plus Jakarta Sans bold sample",
    },
];

const DATA_FONT_WEIGHT_SAMPLES: readonly TypographyWeightSample[] = [
    {
        id: "data-regular",
        label: "Regular 400",
        classes: "font-data text-table-number font-normal",
        preview: "12840.55 / tx_2026_00043",
    },
    {
        id: "data-medium",
        label: "Medium 500",
        classes: "font-data text-table-number font-medium",
        preview: "12840.55 / tx_2026_00043",
    },
    {
        id: "data-semibold",
        label: "Semibold 600",
        classes: "font-data text-table-number font-semibold",
        preview: "12840.55 / tx_2026_00043",
    },
];

const NUMERIC_TYPOGRAPHY_SAMPLES: readonly TypographyTokenSample[] = [
    {
        id: "kpi",
        name: "KPI",
        classes: "text-kpi",
        preview: "98,760",
        description: "Large primary metric.",
    },
    {
        id: "money",
        name: "Money",
        classes: "text-money",
        preview: "$12,840.55",
        description: "Monetary highlight with tabular digits.",
    },
    {
        id: "table-number",
        name: "Table Number",
        classes: "text-table-number",
        preview: "2,770.11",
        description: "Default number style for table cells.",
    },
    {
        id: "data-id",
        name: "Data Identifier",
        classes: "font-data text-body",
        preview: "tx_2026_00043",
        description: "Monospaced identifier formatting.",
    },
];

/**
 * @summary Renders the UI Core Kit sandbox page for visual validation.
 * @returns Sandbox page component.
 */
export function SandboxPage(): JSX.Element {
    const controller = useMemo(() => createSandboxController(), []);

    const [theme, setTheme] = useState<Theme>(controller.getCurrentTheme());
    const [modalState, setModalState] = useState<SandboxModalState>(controller.getDefaultModalState());
    const [filters, setFilters] = useState<SandboxFilters>(controller.getDefaultFilters());
    const [dataTableMode, setDataTableMode] = useState<SandboxDataTableMode>(SANDBOX_DATA_TABLE_MODE.READY);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [toasts, setToasts] = useState(getToasts());

    const [textInputValue, setTextInputValue] = useState<string>("Sandbox text");
    const [emailInputValue, setEmailInputValue] = useState<string>("sandbox@laurus.dev");
    const [passwordInputValue, setPasswordInputValue] = useState<string>("12345678");
    const [searchInputValue, setSearchInputValue] = useState<string>("");
    const [prefixedInputValue, setPrefixedInputValue] = useState<string>("150");
    const [hintInputValue, setHintInputValue] = useState<string>("Hint text");
    const [errorInputValue, setErrorInputValue] = useState<string>("not-an-email");
    const [numericInputValue, setNumericInputValue] = useState<string>("12840.55");

    const [selectWithPlaceholderValue, setSelectWithPlaceholderValue] = useState<string>("");
    const [selectValue, setSelectValue] = useState<string>("active");
    const [selectErrorValue, setSelectErrorValue] = useState<string>("");

    const tableColumns = controller.getUserColumns();
    const filterFields = controller.getFilterFields();
    const filteredUsers = useMemo(() => controller.filterUsers(filters), [controller, filters]);
    const totalPages = useMemo(() => controller.getTotalPages(filteredUsers.length, PAGE_SIZE), [controller, filteredUsers.length]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedUsers = useMemo(
        () => controller.paginateUsers(filteredUsers, currentPage, PAGE_SIZE),
        [controller, filteredUsers, currentPage]
    );
    const dataTableRows = useMemo(
        () => controller.resolveDataTableRows(paginatedUsers, dataTableMode),
        [controller, paginatedUsers, dataTableMode]
    );

    const accordionItems: readonly AccordionItem[] = useMemo(
        () => [
            {
                id: "sandbox-accordion-1",
                title: ResourceKey.FIELD_LABEL_MESSAGE,
                content: "Accordion content block for UI contract validation.",
                openByDefault: true,
            },
            {
                id: "sandbox-accordion-2",
                title: ResourceKey.FIELD_LABEL_OBSERVATION,
                content: "Second accordion panel to validate collapse behavior.",
            },
        ],
        []
    );

    useEffect(() => {
        return subscribeToasts((nextToasts) => setToasts(nextToasts));
    }, []);

    useEffect(() => {
        const previousLocale = getLocale();
        setLocale(Language.EN_US);

        return () => {
            setLocale(previousLocale);
        };
    }, []);

    const handleThemeChange = (nextTheme: Theme): void => setTheme(controller.applyTheme(nextTheme));
    const handleFilterChange = (nextValues: Partial<SandboxFilters>): void => {
        setFilters(controller.mergeFilters(nextValues));
        setCurrentPage(1);
    };
    const handleOpenModal = (patch: Partial<SandboxModalState>): void => {
        setModalState((current) => controller.openModal(current, patch));
    };
    const handleCloseModal = (): void => setModalState((current) => controller.closeModal(current));

    return (
        <PageContainer>
            <div class={CANVAS_CLASS}>
                <div class="space-y-6">
                <section class={SECTION_CLASS}>
                    <h1 class="text-page-title">UI Sandbox</h1>
                    <p class="text-body">Development-only page for validating UI Core Kit behavior with local typed data.</p>
                </section>

                <section class={SECTION_CLASS}>
                    <div class="space-y-5">
                        <div class="space-y-2">
                            <h2 class="text-section-title">Typography Foundation</h2>
                            <p class="text-body">
                                Complete reference for semantic typography tokens, font families, and supported font
                                weights.
                            </p>
                        </div>

                        <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            <div class={`space-y-3 ${DEMO_PANEL_CLASS}`}>
                                <h3 class="text-card-title">Semantic Text Tokens</h3>
                                <p class="text-caption text-base-content/70">
                                    Each row renders the style preview and the exact class used.
                                </p>
                                <div class="space-y-3">
                                    {TYPOGRAPHY_TOKEN_SAMPLES.map((sample) => (
                                        <div key={sample.id} class="rounded-lg border border-base-300 bg-base-200/40 p-3">
                                            <div class="space-y-2">
                                                <p class="text-label">{sample.name}</p>
                                                <p class={sample.classes}>{sample.preview}</p>
                                                <p class="text-caption text-base-content/70">{sample.description}</p>
                                                <code class="inline-flex rounded-md border border-base-300 bg-base-100 px-2 py-1 font-data text-tooltip">
                                                    {sample.classes}
                                                </code>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div class={`space-y-3 ${DEMO_PANEL_CLASS}`}>
                                <h3 class="text-card-title">Font Families and Weights</h3>
                                <p class="text-caption text-base-content/70">
                                    Use only loaded weights to keep rendering stable across web and mobile builds.
                                </p>
                                <div class="space-y-3">
                                    <div class="space-y-3 rounded-lg border border-base-300 bg-base-200/40 p-3">
                                        <p class="text-label">UI Font: Plus Jakarta Sans (`font-ui`)</p>
                                        <div class="space-y-2">
                                            {UI_FONT_WEIGHT_SAMPLES.map((sample) => (
                                                <div key={sample.id} class="space-y-1 rounded-md border border-base-300 bg-base-100 p-2">
                                                    <p class="text-caption text-base-content/70">{sample.label}</p>
                                                    <p class={sample.classes}>{sample.preview}</p>
                                                    <code class="inline-flex rounded border border-base-300 bg-base-200 px-2 py-1 font-data text-tooltip">
                                                        {sample.classes}
                                                    </code>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div class="space-y-3 rounded-lg border border-base-300 bg-base-200/40 p-3">
                                        <p class="text-label">Data Font: IBM Plex Mono (`font-data`)</p>
                                        <div class="space-y-2">
                                            {DATA_FONT_WEIGHT_SAMPLES.map((sample) => (
                                                <div key={sample.id} class="space-y-1 rounded-md border border-base-300 bg-base-100 p-2">
                                                    <p class="text-caption text-base-content/70">{sample.label}</p>
                                                    <p class={sample.classes}>{sample.preview}</p>
                                                    <code class="inline-flex rounded border border-base-300 bg-base-200 px-2 py-1 font-data text-tooltip">
                                                        {sample.classes}
                                                    </code>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class={SECTION_CLASS}>
                    <div class="space-y-5">
                        <div class="space-y-2">
                            <h2 class="text-section-title">Numeric Typography</h2>
                            <p class="text-body">
                                Dedicated data typography with tabular digits for KPIs, monetary values, identifiers,
                                forms, and tables.
                            </p>
                        </div>

                        <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            <div class={`space-y-3 ${DEMO_PANEL_CLASS}`}>
                                <h3 class="text-card-title">Numeric Tokens</h3>
                                <div class="space-y-3">
                                    {NUMERIC_TYPOGRAPHY_SAMPLES.map((sample) => (
                                        <div key={sample.id} class="rounded-lg border border-base-300 bg-base-200/40 p-3">
                                            <div class="space-y-2">
                                                <p class="text-label">{sample.name}</p>
                                                <p class={sample.classes}>{sample.preview}</p>
                                                <p class="text-caption text-base-content/70">{sample.description}</p>
                                                <code class="inline-flex rounded-md border border-base-300 bg-base-100 px-2 py-1 font-data text-tooltip">
                                                    {sample.classes}
                                                </code>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div class={`space-y-3 ${DEMO_PANEL_CLASS}`}>
                                <h3 class="text-card-title">Inputs and Table Integration</h3>
                                <div class="space-y-3 rounded-lg border border-base-300 bg-base-200/40 p-3">
                                    <p class="text-label">Inputs with numeric values</p>
                                    <Input
                                        label={ResourceKey.FIELD_LABEL_BALANCE}
                                        type={InputType.NUMBER}
                                        value={numericInputValue}
                                        onChange={setNumericInputValue}
                                    />
                                    <Input
                                        label={ResourceKey.FIELD_LABEL_TOTAL_MONTHS}
                                        type={InputType.NUMBER}
                                        value="12"
                                        readOnly
                                    />
                                    <code class="inline-flex rounded-md border border-base-300 bg-base-100 px-2 py-1 font-data text-tooltip">
                                        Input(type=NUMBER) + font-data
                                    </code>
                                </div>

                                <div class="space-y-3 rounded-lg border border-base-300 bg-base-200/40 p-3">
                                    <p class="text-label">Numeric table columns</p>
                                    <Table
                                        columns={NUMERIC_OVERVIEW_COLUMNS}
                                        rows={NUMERIC_OVERVIEW_ROWS}
                                        getRowKey={(row) => row.transactionId}
                                    />
                                    <code class="inline-flex rounded-md border border-base-300 bg-base-100 px-2 py-1 font-data text-tooltip">
                                        TableColumn.isNumeric = true + text-table-number
                                    </code>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class={SECTION_CLASS}>
                    <h2 class="text-section-title">Color Palette Preview</h2>
                    <p class="text-body">Visual validation of depth, contrast and emphasis using the current theme tokens.</p>
                    <div class="space-y-3">
                        <div class={PALETTE_PANEL_CLASS}>
                            <div class="grid grid-cols-1 sm:grid-cols-4">
                                <div class="bg-base-100 p-4 text-body">Base 100</div>
                                <div class="bg-base-200 p-4 text-body">Base 200</div>
                                <div class="bg-base-300 p-4 text-body">Base 300</div>
                                <div class="bg-neutral p-4 text-body text-neutral-content">Neutral</div>
                            </div>
                        </div>
                        <div class={PALETTE_PANEL_CLASS}>
                            <div class="grid grid-cols-2 sm:grid-cols-4">
                                <div class="bg-primary p-4 text-body text-primary-content">Primary</div>
                                <div class="bg-secondary p-4 text-body text-secondary-content">Secondary</div>
                                <div class="bg-accent p-4 text-body text-accent-content">Accent</div>
                                <div class="bg-info p-4 text-body text-info-content">Info</div>
                            </div>
                        </div>
                        <div class={PALETTE_PANEL_CLASS}>
                            <div class="grid grid-cols-3">
                                <div class="bg-success p-4 text-body text-success-content">Success</div>
                                <div class="bg-warning p-4 text-body text-warning-content">Warning</div>
                                <div class="bg-error p-4 text-body text-error-content">Error</div>
                            </div>
                        </div>
                    </div>
                </section>

                <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <section class={SECTION_CLASS}>
                        <h2 class="text-section-title">Theme Testing Section</h2>
                        <p class="text-body">Switch Daisy themes and confirm typography stays identical while only colors change.</p>
                        <div class="flex flex-wrap gap-2">
                            {THEME_OPTIONS.map((themeOption) => (
                                <Button key={themeOption} variant={theme === themeOption ? ButtonVariant.PRIMARY : ButtonVariant.OUTLINE} onClick={() => handleThemeChange(themeOption)}>
                                    {themeOption === Theme.LIGHT ? "Light" : "Dark"}
                                </Button>
                            ))}
                        </div>
                        <div class="rounded-xl border border-base-300 bg-base-100 p-3">
                            <p class="text-label">Current Theme: {theme}</p>
                            <p class="text-body">UI typography sample remains unchanged across themes.</p>
                            <p class="text-money">$12,840.55</p>
                        </div>
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-section-title">Buttons</h2>
                        <div class="flex flex-wrap gap-2">
                            {(Object.values(ButtonVariant) as readonly ButtonVariant[]).map((variant) => (
                                <Button key={variant} variant={variant}>{variant}</Button>
                            ))}
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <Button size={ButtonSize.SM}>Small</Button>
                            <Button size={ButtonSize.MD}>Medium</Button>
                            <Button size={ButtonSize.LG}>Large</Button>
                            <Button disabled>Disabled</Button>
                            <Button loading>Loading</Button>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            {BUTTON_ICON_EXAMPLES.map((example) => (
                                <Button key={example.icon} variant={example.variant} iconLeft={example.icon}>
                                    {example.icon}
                                </Button>
                            ))}
                        </div>
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-section-title">Inputs</h2>
                        <FormGrid columns={2}>
                            <Input label={ResourceKey.FIELD_LABEL_NAME} type={InputType.TEXT} value={textInputValue} onChange={setTextInputValue} />
                            <Input label={ResourceKey.FIELD_LABEL_EMAIL} type={InputType.EMAIL} icon={IconName.EMAIL} iconPosition={IconPosition.LEFT} value={emailInputValue} onChange={setEmailInputValue} />
                            <Input label={ResourceKey.FIELD_LABEL_PASSWORD} type={InputType.PASSWORD} icon={IconName.LOCK} iconPosition={IconPosition.LEFT} value={passwordInputValue} onChange={setPasswordInputValue} />
                            <Input label={ResourceKey.FIELD_LABEL_NAME} type={InputType.SEARCH} icon={IconName.SEARCH} iconPosition={IconPosition.LEFT} value={searchInputValue} onChange={setSearchInputValue} />
                            <Input label={ResourceKey.FIELD_LABEL_VALUE} value={prefixedInputValue} prefixText={ResourceKey.FIELD_LABEL_CURRENCY} suffixText={ResourceKey.FIELD_LABEL_TOTAL_MONTHS} onChange={setPrefixedInputValue} />
                            <Input label={ResourceKey.FIELD_LABEL_OBSERVATION} value={hintInputValue} hint={ResourceKey.SEARCH_TERM_TOO_SHORT} onChange={setHintInputValue} />
                            <Input label={ResourceKey.FIELD_LABEL_EMAIL} value={errorInputValue} error={ResourceKey.EMAIL_INVALID} onChange={setErrorInputValue} />
                            <Input label={ResourceKey.FIELD_LABEL_PROFILE} value="Disabled input" disabled onChange={() => undefined} />
                        </FormGrid>
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-section-title">Selects</h2>
                        <FormGrid columns={2}>
                            <Select label={ResourceKey.FIELD_LABEL_TYPE} placeholder={ResourceKey.FIELD_LABEL_TYPE} options={SELECT_OPTIONS} value={selectWithPlaceholderValue} onChange={setSelectWithPlaceholderValue} />
                            <Select label={ResourceKey.FIELD_LABEL_ACTIVE} options={SELECT_OPTIONS} value={selectValue} onChange={setSelectValue} />
                            <Select label={ResourceKey.FIELD_LABEL_TAGS} placeholder={ResourceKey.FIELD_LABEL_TAGS} options={SELECT_OPTIONS} value={selectErrorValue} error={ResourceKey.FIELD_REQUIRED} onChange={setSelectErrorValue} />
                        </FormGrid>
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-section-title">Fieldset</h2>
                        <h3 class="text-card-title">FormGrid</h3>
                        <Form onSubmit={() => controller.triggerToast(ToastVariant.SUCCESS)}>
                            <Fieldset legend={ResourceKey.FIELD_LABEL_PROFILE} description={ResourceKey.FIELD_LABEL_OBSERVATION}>
                                <FormGrid columns={2}>
                                    <Input label={ResourceKey.FIELD_LABEL_FIRST_NAME} value={textInputValue} onChange={setTextInputValue} />
                                    <Select label={ResourceKey.FIELD_LABEL_LANGUAGE} options={SELECT_OPTIONS} value={selectValue} onChange={setSelectValue} />
                                </FormGrid>
                                <div class="pt-2">
                                    <Button type="submit" iconLeft={IconName.SAVE}>Submit</Button>
                                </div>
                            </Fieldset>
                        </Form>
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-section-title">Modal</h2>
                        <div class="space-y-3">
                            <div class="flex flex-wrap gap-2">
                                {MODAL_SIZES.map((size) => <Button key={size} variant={ButtonVariant.OUTLINE} onClick={() => handleOpenModal({ size })}>{size.toUpperCase()}</Button>)}
                            </div>
                            <div class="flex flex-wrap gap-2">
                                {MODAL_POSITIONS.map((position) => <Button key={position} variant={ButtonVariant.OUTLINE} onClick={() => handleOpenModal({ position })}>{MODAL_POSITION_LABEL[position]}</Button>)}
                            </div>
                            <div class="flex flex-wrap gap-2">
                                {MODAL_SCROLL_MODES.map((scrollMode) => <Button key={scrollMode} variant={ButtonVariant.OUTLINE} onClick={() => handleOpenModal({ scrollMode })}>{MODAL_SCROLL_LABEL[scrollMode]}</Button>)}
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <Button
                                    variant={ButtonVariant.SECONDARY}
                                    onClick={() =>
                                        handleOpenModal({
                                            size: ModalSize.XL,
                                            position: ModalPosition.CENTER,
                                            scrollMode: ModalScrollMode.BODY,
                                        })
                                    }
                                >
                                    Open Full Scenario
                                </Button>
                            </div>
                            <p class="text-body">
                                Active config: {modalState.size.toUpperCase()} / {MODAL_POSITION_LABEL[modalState.position]} /{" "}
                                {MODAL_SCROLL_LABEL[modalState.scrollMode]}
                            </p>
                        </div>
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-section-title">Tooltip</h2>
                        <div class="flex flex-wrap gap-3">
                            {TOOLTIP_ITEMS.map((item) => (
                                <Tooltip key={item.position} content={item.content} position={item.position}>
                                    <Button variant={ButtonVariant.OUTLINE}>{item.label}</Button>
                                </Tooltip>
                            ))}
                        </div>
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-section-title">Toast</h2>
                        <p class="text-body">Toasts now support both modes: without icon (minimal) and with icon (status-enhanced).</p>
                        <div class={`space-y-3 ${DEMO_PANEL_CLASS}`}>
                            <p class="text-label">Without Icon</p>
                            <div class="flex flex-wrap gap-2">
                                {TOAST_VARIANTS.map((variant) => (
                                    <Button key={`no-icon-${variant}`} variant={TOAST_BUTTON_VARIANT[variant]} onClick={() => controller.triggerToast(variant)}>
                                        {TOAST_LABEL[variant]}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div class={`mt-3 space-y-3 ${DEMO_PANEL_CLASS}`}>
                            <p class="text-label">With Icon</p>
                            <div class="flex flex-wrap gap-2">
                                {TOAST_VARIANTS.map((variant) => (
                                    <Button key={`with-icon-${variant}`} variant={TOAST_BUTTON_VARIANT[variant]} onClick={() => controller.triggerToastWithIcon(variant)}>
                                        {TOAST_LABEL[variant]}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div class="mt-3 flex flex-wrap gap-2">
                            <Button
                                variant={ButtonVariant.OUTLINE}
                                iconLeft={IconName.WARNING}
                                onClick={() => controller.triggerPersistentToast(ToastVariant.WARNING)}
                            >
                                Persistent Warning
                            </Button>
                            <Button
                                variant={ButtonVariant.SECONDARY}
                                iconLeft={IconName.ADD}
                                onClick={controller.triggerToastBurst}
                            >
                                Burst (3)
                            </Button>
                            <Button
                                variant={ButtonVariant.GHOST}
                                iconLeft={IconName.CLOSE}
                                onClick={controller.clearAllToasts}
                            >
                                Clear Toasts
                            </Button>
                        </div>
                        <p class="mt-2 text-body">
                            Active notifications: <span class="font-data">{toasts.length}</span>
                        </p>
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-section-title">Alerts</h2>
                        <p class="text-body">Recommended approach: `soft` for default feedback and `dash` for higher emphasis without looking like CTA buttons.</p>
                        <div class={`mb-3 space-y-3 ${DEMO_PANEL_CLASS}`}>
                            <h3 class="text-card-title">Recommended Surface (Less Button-like)</h3>
                            <p class="text-caption text-base-content/70">
                                Soft keeps alerts informative and calm. Dash adds urgency with stronger borders while staying distinct from action buttons.
                            </p>
                            <div class="space-y-2">
                                <Alert variant={AlertVariant.INFO} style={AlertStyle.SOFT} icon={IconName.INFO}>
                                    Informational updates should use soft styling by default.
                                </Alert>
                                <Alert variant={AlertVariant.SUCCESS} style={AlertStyle.SOFT} icon={IconName.CHECK}>
                                    Success confirmations remain clear without competing with primary buttons.
                                </Alert>
                                <Alert variant={AlertVariant.WARNING} style={AlertStyle.DASH} icon={IconName.WARNING}>
                                    Warning states can use dash to add stronger visual emphasis.
                                </Alert>
                                <Alert variant={AlertVariant.ERROR} style={AlertStyle.DASH} icon={IconName.ERROR}>
                                    Error states should stand out with border emphasis and icon support.
                                </Alert>
                            </div>
                        </div>
                        <p class="text-body">Full gallery with all DaisyUI alert patterns mapped to typed Alert props.</p>
                        <div class="grid grid-cols-1 gap-3 xl:grid-cols-2">
                            <div class={`space-y-2 ${DEMO_PANEL_CLASS}`}>
                                <h3 class="text-card-title">Default (Solid)</h3>
                                <Alert variant={AlertVariant.INFO} hideIcon compact>12 unread messages. Tap to see.</Alert>
                                <Alert variant={AlertVariant.SUCCESS} hideIcon compact>Your purchase has been confirmed!</Alert>
                                <Alert variant={AlertVariant.WARNING} hideIcon compact>Warning: Invalid email address!</Alert>
                                <Alert variant={AlertVariant.ERROR} hideIcon compact>Error! Task failed successfully.</Alert>
                            </div>

                            <div class={`space-y-2 ${DEMO_PANEL_CLASS}`}>
                                <h3 class="text-card-title">Outline</h3>
                                <Alert variant={AlertVariant.INFO} style={AlertStyle.OUTLINE} hideIcon compact>12 unread messages. Tap to see.</Alert>
                                <Alert variant={AlertVariant.SUCCESS} style={AlertStyle.OUTLINE} hideIcon compact>Your purchase has been confirmed!</Alert>
                                <Alert variant={AlertVariant.WARNING} style={AlertStyle.OUTLINE} hideIcon compact>Warning: Invalid email address!</Alert>
                                <Alert variant={AlertVariant.ERROR} style={AlertStyle.OUTLINE} hideIcon compact>Error! Task failed successfully.</Alert>
                            </div>

                            <div class={`space-y-2 ${DEMO_PANEL_CLASS}`}>
                                <h3 class="text-card-title">Soft</h3>
                                <Alert variant={AlertVariant.INFO} style={AlertStyle.SOFT} hideIcon compact>12 unread messages. Tap to see.</Alert>
                                <Alert variant={AlertVariant.SUCCESS} style={AlertStyle.SOFT} hideIcon compact>Your purchase has been confirmed!</Alert>
                                <Alert variant={AlertVariant.WARNING} style={AlertStyle.SOFT} hideIcon compact>Warning: Invalid email address!</Alert>
                                <Alert variant={AlertVariant.ERROR} style={AlertStyle.SOFT} hideIcon compact>Error! Task failed successfully.</Alert>
                            </div>

                            <div class={`space-y-2 ${DEMO_PANEL_CLASS}`}>
                                <h3 class="text-card-title">Dash</h3>
                                <Alert variant={AlertVariant.INFO} style={AlertStyle.DASH} hideIcon compact>12 unread messages. Tap to see.</Alert>
                                <Alert variant={AlertVariant.SUCCESS} style={AlertStyle.DASH} hideIcon compact>Your purchase has been confirmed!</Alert>
                                <Alert variant={AlertVariant.WARNING} style={AlertStyle.DASH} hideIcon compact>Warning: Invalid email address!</Alert>
                                <Alert variant={AlertVariant.ERROR} style={AlertStyle.DASH} hideIcon compact>Error! Task failed successfully.</Alert>
                            </div>

                            <div class={`space-y-2 ${DEMO_PANEL_CLASS}`}>
                                <h3 class="text-card-title">With Icon</h3>
                                <Alert icon={IconName.INFO}>12 unread messages. Tap to see.</Alert>
                                <Alert variant={AlertVariant.SUCCESS} icon={IconName.CHECK}>Your purchase has been confirmed!</Alert>
                                <Alert variant={AlertVariant.SUCCESS} icon={IconName.CHECK}>Your purchase has been confirmed!</Alert>
                                <Alert variant={AlertVariant.WARNING} icon={IconName.WARNING}>Warning: Invalid email address!</Alert>
                                <Alert variant={AlertVariant.ERROR} icon={IconName.ERROR}>Error! Task failed successfully.</Alert>
                            </div>

                            <div class={`space-y-3 ${DEMO_PANEL_CLASS}`}>
                                <h3 class="text-card-title">Actions/Responsive</h3>
                                <Alert
                                    icon={IconName.INFO}
                                    direction={AlertDirection.RESPONSIVE}
                                    actions={
                                        <>
                                            <Button size={ButtonSize.SM} variant={ButtonVariant.OUTLINE}>Deny</Button>
                                            <Button size={ButtonSize.SM} variant={ButtonVariant.PRIMARY}>Accept</Button>
                                        </>
                                    }
                                >
                                    we use cookies for no reason.
                                </Alert>
                                <Alert
                                    icon={IconName.INFO}
                                    direction={AlertDirection.RESPONSIVE}
                                    actions={<Button size={ButtonSize.SM} variant={ButtonVariant.OUTLINE}>See</Button>}
                                >
                                    <div>
                                        <h4 class="text-label font-semibold">New message!</h4>
                                        <p class="text-caption">You have 1 unread message</p>
                                    </div>
                                </Alert>
                            </div>
                        </div>
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-section-title">Loader</h2>
                        <div class="flex items-center gap-4">
                            <Loader size={LoaderSize.SM} /><Loader size={LoaderSize.MD} /><Loader size={LoaderSize.LG} />
                        </div>
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-section-title">Card</h2>
                        <Card title={ResourceKey.FIELD_LABEL_TITLE} description={ResourceKey.FIELD_LABEL_MESSAGE}>
                            <p class="text-body">Card content block for spacing and theme validation.</p>
                        </Card>
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-section-title">Examples</h2>
                        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <Card title={ResourceKey.FIELD_LABEL_PROFILE} compact>
                                <p class="text-body">Quick action example with a semantic icon button.</p>
                                <div class="pt-2">
                                    <Button
                                        variant={ButtonVariant.PRIMARY}
                                        iconLeft={IconName.SAVE}
                                        onClick={() => controller.triggerToast(ToastVariant.SUCCESS)}
                                    >
                                        Save Draft
                                    </Button>
                                </div>
                            </Card>
                            <Card title={ResourceKey.FIELD_LABEL_TAGS} compact>
                                <p class="text-body">Preview card combining visual and notification feedback.</p>
                                <div class="pt-2">
                                    <Button
                                        variant={ButtonVariant.OUTLINE}
                                        iconLeft={IconName.INFO}
                                        onClick={() => controller.triggerToast(ToastVariant.INFO)}
                                    >
                                        Show Info
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </section>

                    <section class={`${SECTION_CLASS} xl:col-span-2`}>
                        <h2 class="text-section-title">Table Suite</h2>
                        <p class="text-body">Basic table rendering, DataTable states, filters and pagination in one unified validation block.</p>
                        <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            <div class={`space-y-3 ${DEMO_PANEL_CLASS}`}>
                                <h3 class="text-card-title">Table</h3>
                                <Table
                                    columns={tableColumns}
                                    rows={paginatedUsers}
                                    getRowKey={(row) => row.id}
                                    actionsLabel={ResourceKey.FIELD_LABEL_TYPE}
                                    onRowClick={() => controller.triggerToast(ToastVariant.INFO)}
                                    renderRowActions={() => (
                                        <Button
                                            size={ButtonSize.SM}
                                            variant={ButtonVariant.GHOST}
                                            iconLeft={IconName.EDIT}
                                            onClick={() => controller.triggerToast(ToastVariant.INFO)}
                                        />
                                    )}
                                />
                            </div>

                            <div class={`space-y-3 ${DEMO_PANEL_CLASS}`}>
                                <h3 class="text-card-title">DataTable</h3>
                                <div class="flex flex-wrap gap-2">
                                    {(Object.values(SANDBOX_DATA_TABLE_MODE) as readonly SandboxDataTableMode[]).map((mode) => (
                                        <Button key={mode} variant={dataTableMode === mode ? ButtonVariant.PRIMARY : ButtonVariant.OUTLINE} onClick={() => setDataTableMode(mode)}>
                                            {DATA_TABLE_MODE_LABEL[mode]}
                                        </Button>
                                    ))}
                                </div>
                                <DataTable
                                    columns={tableColumns}
                                    rows={dataTableRows}
                                    loading={dataTableMode === SANDBOX_DATA_TABLE_MODE.LOADING}
                                    errorTitle={dataTableMode === SANDBOX_DATA_TABLE_MODE.ERROR ? ResourceKey.UNEXPECTED_ERROR : undefined}
                                    errorDescription={dataTableMode === SANDBOX_DATA_TABLE_MODE.ERROR ? ResourceKey.INTERNAL_SERVER_ERROR : undefined}
                                    errorActionLabel={dataTableMode === SANDBOX_DATA_TABLE_MODE.ERROR ? ResourceKey.FIELD_LABEL_PROFILE : undefined}
                                    onErrorAction={() => setDataTableMode(SANDBOX_DATA_TABLE_MODE.READY)}
                                    emptyStateTitle={ResourceKey.NO_RECORDS_FOUND}
                                    emptyStateDescription={ResourceKey.FIELD_LABEL_MESSAGE}
                                    getRowKey={(row) => row.id}
                                    actionsLabel={ResourceKey.FIELD_LABEL_TYPE}
                                    renderRowActions={() => <Button size={ButtonSize.SM} variant={ButtonVariant.LINK}>View</Button>}
                                />
                            </div>

                            <div class={`space-y-3 ${DEMO_PANEL_CLASS}`}>
                                <h3 class="text-card-title">FilterBar</h3>
                                <FilterBar<SandboxFilters>
                                    fields={filterFields}
                                    values={filters}
                                    onChange={handleFilterChange}
                                    columns={2}
                                    onSubmit={() => controller.triggerToast(ToastVariant.INFO)}
                                    onClear={() => {
                                        setFilters(controller.getDefaultFilters());
                                        setCurrentPage(1);
                                    }}
                                />
                                <p class="text-body">
                                    Filters: search="{filters.search || "-"}", status="{filters.status}". Matches:{" "}
                                    <span class="font-data">{filteredUsers.length}</span>
                                </p>
                            </div>

                            <div class={`space-y-3 ${DEMO_PANEL_CLASS}`}>
                                <h3 class="text-card-title">Pagination</h3>
                                <p class="text-body">
                                    Page <span class="font-data">{currentPage}</span> of{" "}
                                    <span class="font-data">{totalPages}</span>
                                </p>
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                            </div>
                        </div>
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-section-title">EmptyState</h2>
                        <EmptyState title={ResourceKey.NO_RECORDS_FOUND} description={ResourceKey.FIELD_LABEL_MESSAGE} actionLabel={ResourceKey.FIELD_LABEL_PROFILE} onAction={() => controller.triggerToast(ToastVariant.INFO)} />
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-section-title">Accordion</h2>
                        <Accordion items={accordionItems} allowMultiple={false} />
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-section-title">Bullets</h2>
                        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Bullets items={[ResourceKey.FIELD_LABEL_NAME, ResourceKey.FIELD_LABEL_EMAIL, ResourceKey.FIELD_LABEL_PASSWORD]} />
                            <Bullets ordered items={[ResourceKey.FIELD_LABEL_TITLE, ResourceKey.FIELD_LABEL_MESSAGE, ResourceKey.FIELD_LABEL_DATE]} />
                        </div>
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-section-title">ErrorState</h2>
                        <ErrorState title={ResourceKey.UNEXPECTED_ERROR} description={ResourceKey.INTERNAL_SERVER_ERROR} actionLabel={ResourceKey.FIELD_LABEL_PROFILE} onAction={() => controller.triggerToast(ToastVariant.ERROR)} />
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-section-title">Icons</h2>
                        <div class="grid grid-cols-3 gap-3 sm:grid-cols-5">
                            {ICONS.map((iconName) => (
                                <div key={iconName} class="flex flex-col items-center gap-1 rounded border border-base-300 p-2 text-caption">
                                    <Icon name={iconName} />
                                    <span>{iconName}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
            </div>

            <Modal
                open={modalState.open}
                title={ResourceKey.FIELD_LABEL_MESSAGE}
                size={modalState.size}
                position={modalState.position}
                scrollMode={modalState.scrollMode}
                onClose={handleCloseModal}
                footer={
                    <>
                        <Button variant={ButtonVariant.GHOST} onClick={handleCloseModal}>Cancel</Button>
                        <Button variant={ButtonVariant.PRIMARY} onClick={() => { controller.triggerToast(ToastVariant.SUCCESS); handleCloseModal(); }}>Confirm</Button>
                    </>
                }
            >
                <div class="space-y-3">
                    {MODAL_PARAGRAPHS.map((paragraph) => <p key={paragraph} class="text-body leading-relaxed">{paragraph}</p>)}
                </div>
            </Modal>

            <ToastContainer toasts={toasts} onClose={removeToast} />
        </PageContainer>
    );
}
