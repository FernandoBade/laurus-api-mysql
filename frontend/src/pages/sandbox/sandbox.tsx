/**
 * @summary Sandbox page used for UI Core Kit validation. Not a business feature.
 */

import type { JSX } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { IconPosition } from "@shared/enums/icon-position.enums";
import { IconName } from "@shared/enums/icon.enums";
import { InputType } from "@shared/enums/input.enums";
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
import { ToastContainer } from "@/components/toast/toast";
import { Tooltip } from "@/components/tooltip/tooltip";
import {
    createSandboxController,
    SANDBOX_DATA_TABLE_MODE,
    type SandboxDataTableMode,
    type SandboxFilters,
    type SandboxModalState,
} from "@/pages/sandbox/sandbox.controller";
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
                    <h1 class="text-2xl font-semibold">UI Sandbox</h1>
                    <p class="text-sm">Development-only page for validating UI Core Kit behavior with local typed data.</p>
                </section>

                <section class={SECTION_CLASS}>
                    <h2 class="text-lg font-semibold">Color Palette Preview</h2>
                    <p class="text-sm">Visual validation of depth, contrast and emphasis using the current theme tokens.</p>
                    <div class="space-y-3">
                        <div class={PALETTE_PANEL_CLASS}>
                            <div class="grid grid-cols-1 sm:grid-cols-4">
                                <div class="bg-base-100 p-4 text-sm">Base 100</div>
                                <div class="bg-base-200 p-4 text-sm">Base 200</div>
                                <div class="bg-base-300 p-4 text-sm">Base 300</div>
                                <div class="bg-neutral p-4 text-sm text-neutral-content">Neutral</div>
                            </div>
                        </div>
                        <div class={PALETTE_PANEL_CLASS}>
                            <div class="grid grid-cols-2 sm:grid-cols-4">
                                <div class="bg-primary p-4 text-sm text-primary-content">Primary</div>
                                <div class="bg-secondary p-4 text-sm text-secondary-content">Secondary</div>
                                <div class="bg-accent p-4 text-sm text-accent-content">Accent</div>
                                <div class="bg-info p-4 text-sm text-info-content">Info</div>
                            </div>
                        </div>
                        <div class={PALETTE_PANEL_CLASS}>
                            <div class="grid grid-cols-3">
                                <div class="bg-success p-4 text-sm text-success-content">Success</div>
                                <div class="bg-warning p-4 text-sm text-warning-content">Warning</div>
                                <div class="bg-error p-4 text-sm text-error-content">Error</div>
                            </div>
                        </div>
                    </div>
                </section>

                <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <section class={SECTION_CLASS}>
                        <h2 class="text-lg font-semibold">Theme Switch</h2>
                        <p class="text-sm">Theme should affect colors only.</p>
                        <div class="flex flex-wrap gap-2">
                            {THEME_OPTIONS.map((themeOption) => (
                                <Button key={themeOption} variant={theme === themeOption ? ButtonVariant.PRIMARY : ButtonVariant.OUTLINE} onClick={() => handleThemeChange(themeOption)}>
                                    {themeOption === Theme.LIGHT ? "Light" : "Dark"}
                                </Button>
                            ))}
                        </div>
                        <p class="text-sm">Current: {theme}</p>
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-lg font-semibold">Buttons</h2>
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
                        <h2 class="text-lg font-semibold">Inputs</h2>
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
                        <h2 class="text-lg font-semibold">Selects</h2>
                        <FormGrid columns={2}>
                            <Select label={ResourceKey.FIELD_LABEL_TYPE} placeholder={ResourceKey.FIELD_LABEL_TYPE} options={SELECT_OPTIONS} value={selectWithPlaceholderValue} onChange={setSelectWithPlaceholderValue} />
                            <Select label={ResourceKey.FIELD_LABEL_ACTIVE} options={SELECT_OPTIONS} value={selectValue} onChange={setSelectValue} />
                            <Select label={ResourceKey.FIELD_LABEL_TAGS} placeholder={ResourceKey.FIELD_LABEL_TAGS} options={SELECT_OPTIONS} value={selectErrorValue} error={ResourceKey.FIELD_REQUIRED} onChange={setSelectErrorValue} />
                        </FormGrid>
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-lg font-semibold">Fieldset</h2>
                        <h3 class="text-sm font-semibold">FormGrid</h3>
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
                        <h2 class="text-lg font-semibold">Modal</h2>
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
                            <p class="text-sm">
                                Active config: {modalState.size.toUpperCase()} / {MODAL_POSITION_LABEL[modalState.position]} /{" "}
                                {MODAL_SCROLL_LABEL[modalState.scrollMode]}
                            </p>
                        </div>
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-lg font-semibold">Tooltip</h2>
                        <div class="flex flex-wrap gap-3">
                            {TOOLTIP_ITEMS.map((item) => (
                                <Tooltip key={item.position} content={item.content} position={item.position}>
                                    <Button variant={ButtonVariant.OUTLINE}>{item.label}</Button>
                                </Tooltip>
                            ))}
                        </div>
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-lg font-semibold">Toast</h2>
                        <div class="flex flex-wrap gap-2">
                            {TOAST_VARIANTS.map((variant) => (
                                <Button key={variant} variant={TOAST_BUTTON_VARIANT[variant]} onClick={() => controller.triggerToast(variant)}>
                                    {TOAST_LABEL[variant]}
                                </Button>
                            ))}
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
                        <p class="mt-2 text-sm">Active notifications: {toasts.length}</p>
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-lg font-semibold">Alerts</h2>
                        <p class="text-sm">Gallery with all DaisyUI alert patterns mapped to typed Alert props.</p>
                        <div class="grid grid-cols-1 gap-3 xl:grid-cols-2">
                            <div class={`space-y-2 ${DEMO_PANEL_CLASS}`}>
                                <h3 class="text-sm font-semibold">Default</h3>
                                <Alert variant={AlertVariant.INFO} hideIcon compact>12 unread messages. Tap to see.</Alert>
                                <Alert variant={AlertVariant.SUCCESS} hideIcon compact>Your purchase has been confirmed!</Alert>
                                <Alert variant={AlertVariant.WARNING} hideIcon compact>Warning: Invalid email address!</Alert>
                                <Alert variant={AlertVariant.ERROR} hideIcon compact>Error! Task failed successfully.</Alert>
                            </div>

                            <div class={`space-y-2 ${DEMO_PANEL_CLASS}`}>
                                <h3 class="text-sm font-semibold">Outline</h3>
                                <Alert variant={AlertVariant.INFO} style={AlertStyle.OUTLINE} hideIcon compact>12 unread messages. Tap to see.</Alert>
                                <Alert variant={AlertVariant.SUCCESS} style={AlertStyle.OUTLINE} hideIcon compact>Your purchase has been confirmed!</Alert>
                                <Alert variant={AlertVariant.WARNING} style={AlertStyle.OUTLINE} hideIcon compact>Warning: Invalid email address!</Alert>
                                <Alert variant={AlertVariant.ERROR} style={AlertStyle.OUTLINE} hideIcon compact>Error! Task failed successfully.</Alert>
                            </div>

                            <div class={`space-y-2 ${DEMO_PANEL_CLASS}`}>
                                <h3 class="text-sm font-semibold">Soft</h3>
                                <Alert variant={AlertVariant.INFO} style={AlertStyle.SOFT} hideIcon compact>12 unread messages. Tap to see.</Alert>
                                <Alert variant={AlertVariant.SUCCESS} style={AlertStyle.SOFT} hideIcon compact>Your purchase has been confirmed!</Alert>
                                <Alert variant={AlertVariant.WARNING} style={AlertStyle.SOFT} hideIcon compact>Warning: Invalid email address!</Alert>
                                <Alert variant={AlertVariant.ERROR} style={AlertStyle.SOFT} hideIcon compact>Error! Task failed successfully.</Alert>
                            </div>

                            <div class={`space-y-2 ${DEMO_PANEL_CLASS}`}>
                                <h3 class="text-sm font-semibold">Dash</h3>
                                <Alert variant={AlertVariant.INFO} style={AlertStyle.DASH} hideIcon compact>12 unread messages. Tap to see.</Alert>
                                <Alert variant={AlertVariant.SUCCESS} style={AlertStyle.DASH} hideIcon compact>Your purchase has been confirmed!</Alert>
                                <Alert variant={AlertVariant.WARNING} style={AlertStyle.DASH} hideIcon compact>Warning: Invalid email address!</Alert>
                                <Alert variant={AlertVariant.ERROR} style={AlertStyle.DASH} hideIcon compact>Error! Task failed successfully.</Alert>
                            </div>

                            <div class={`space-y-2 ${DEMO_PANEL_CLASS}`}>
                                <h3 class="text-sm font-semibold">With Icon</h3>
                                <Alert icon={IconName.INFO}>12 unread messages. Tap to see.</Alert>
                                <Alert variant={AlertVariant.SUCCESS} icon={IconName.CHECK}>Your purchase has been confirmed!</Alert>
                                <Alert variant={AlertVariant.WARNING} icon={IconName.WARNING}>Warning: Invalid email address!</Alert>
                                <Alert variant={AlertVariant.ERROR} icon={IconName.CLOSE}>Error! Task failed successfully.</Alert>
                            </div>

                            <div class={`space-y-3 ${DEMO_PANEL_CLASS}`}>
                                <h3 class="text-sm font-semibold">Actions/Responsive</h3>
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
                                        <h4 class="font-bold">New message!</h4>
                                        <p class="text-xs">You have 1 unread message</p>
                                    </div>
                                </Alert>
                            </div>
                        </div>
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-lg font-semibold">Loader</h2>
                        <div class="flex items-center gap-4">
                            <Loader size={LoaderSize.SM} /><Loader size={LoaderSize.MD} /><Loader size={LoaderSize.LG} />
                        </div>
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-lg font-semibold">Card</h2>
                        <Card title={ResourceKey.FIELD_LABEL_TITLE} description={ResourceKey.FIELD_LABEL_MESSAGE}>
                            <p class="text-sm">Card content block for spacing and theme validation.</p>
                        </Card>
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-lg font-semibold">Examples</h2>
                        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <Card title={ResourceKey.FIELD_LABEL_PROFILE} compact>
                                <p class="text-sm">Quick action example with a semantic icon button.</p>
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
                                <p class="text-sm">Preview card combining visual and notification feedback.</p>
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
                        <h2 class="text-lg font-semibold">Table Suite</h2>
                        <p class="text-sm">Basic table rendering, DataTable states, filters and pagination in one unified validation block.</p>
                        <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            <div class={`space-y-3 ${DEMO_PANEL_CLASS}`}>
                                <h3 class="text-sm font-semibold">Table</h3>
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
                                <h3 class="text-sm font-semibold">DataTable</h3>
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
                                <h3 class="text-sm font-semibold">FilterBar</h3>
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
                                <p class="text-sm">Filters: search="{filters.search || "-"}", status="{filters.status}". Matches: {filteredUsers.length}</p>
                            </div>

                            <div class={`space-y-3 ${DEMO_PANEL_CLASS}`}>
                                <h3 class="text-sm font-semibold">Pagination</h3>
                                <p class="text-sm">Page {currentPage} of {totalPages}</p>
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                            </div>
                        </div>
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-lg font-semibold">EmptyState</h2>
                        <EmptyState title={ResourceKey.NO_RECORDS_FOUND} description={ResourceKey.FIELD_LABEL_MESSAGE} actionLabel={ResourceKey.FIELD_LABEL_PROFILE} onAction={() => controller.triggerToast(ToastVariant.INFO)} />
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-lg font-semibold">Accordion</h2>
                        <Accordion items={accordionItems} allowMultiple={false} />
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-lg font-semibold">Bullets</h2>
                        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Bullets items={[ResourceKey.FIELD_LABEL_NAME, ResourceKey.FIELD_LABEL_EMAIL, ResourceKey.FIELD_LABEL_PASSWORD]} />
                            <Bullets ordered items={[ResourceKey.FIELD_LABEL_TITLE, ResourceKey.FIELD_LABEL_MESSAGE, ResourceKey.FIELD_LABEL_DATE]} />
                        </div>
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-lg font-semibold">ErrorState</h2>
                        <ErrorState title={ResourceKey.UNEXPECTED_ERROR} description={ResourceKey.INTERNAL_SERVER_ERROR} actionLabel={ResourceKey.FIELD_LABEL_PROFILE} onAction={() => controller.triggerToast(ToastVariant.ERROR)} />
                    </section>

                    <section class={SECTION_CLASS}>
                        <h2 class="text-lg font-semibold">Icons</h2>
                        <div class="grid grid-cols-3 gap-3 sm:grid-cols-5">
                            {ICONS.map((iconName) => (
                                <div key={iconName} class="flex flex-col items-center gap-1 rounded border border-base-300 p-2 text-xs">
                                    <Icon name={iconName} size={18} />
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
                    {MODAL_PARAGRAPHS.map((paragraph) => <p key={paragraph} class="text-sm leading-relaxed">{paragraph}</p>)}
                </div>
            </Modal>

            <ToastContainer toasts={toasts} onClose={removeToast} />
        </PageContainer>
    );
}
