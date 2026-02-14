import type { ComponentChildren } from "preact";
import type { ResourceKey } from "@shared/i18n/resource.keys";

/**
 * @summary Column definition for generic table rendering.
 */
export interface TableColumn<TRow> {
    readonly key: string;
    readonly header: ResourceKey;
    readonly render: (row: TRow, rowIndex: number) => ComponentChildren;
}

/**
 * @summary Typed table props.
 */
export interface TableProps<TRow> {
    readonly columns: readonly TableColumn<TRow>[];
    readonly rows: readonly TRow[];
    readonly getRowKey?: (row: TRow, rowIndex: number) => string;
    readonly onRowClick?: (row: TRow) => void;
    readonly actionsLabel?: ResourceKey;
    readonly renderRowActions?: (row: TRow, rowIndex: number) => ComponentChildren;
}
