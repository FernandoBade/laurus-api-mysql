import type { ComponentChildren } from "preact";
import type { ResourceKey } from "@shared/i18n/resource.keys";
import { IconName } from "@shared/enums/icon.enums";
import { LoaderSize } from "@shared/enums/ui.enums";
import type { TableColumn } from "@/components/table/table.types";

/**
 * @summary Typed data table props with loading and empty states.
 */
export interface DataTableProps<TRow> {
    readonly columns: readonly TableColumn<TRow>[];
    readonly rows: readonly TRow[];
    readonly loading?: boolean;
    readonly errorTitle?: ResourceKey;
    readonly errorDescription?: ResourceKey;
    readonly errorActionLabel?: ResourceKey;
    readonly onErrorAction?: () => void;
    readonly loaderSize?: LoaderSize;
    readonly emptyStateTitle: ResourceKey;
    readonly emptyStateDescription?: ResourceKey;
    readonly emptyStateIcon?: IconName;
    readonly getRowKey?: (row: TRow, rowIndex: number) => string;
    readonly onRowClick?: (row: TRow) => void;
    readonly actionsLabel?: ResourceKey;
    readonly renderRowActions?: (row: TRow, rowIndex: number) => ComponentChildren;
}
