import type { JSX } from "preact";
import { LoaderSize } from "@shared/enums/ui.enums";
import { EmptyState } from "@/components/empty-state/empty-state";
import { ErrorState } from "@/components/error-state/error-state";
import { Loader } from "@/components/loader/loader";
import { Table } from "@/components/table/table";
import type { DataTableProps } from "@/components/data-table/data-table.types";

/**
 * @summary Renders a generic data table with loading and empty-state handling.
 * @param props Data table configuration.
 * @returns Data table component.
 */
export function DataTable<TRow>({
    columns,
    rows,
    loading = false,
    errorTitle,
    errorDescription,
    errorActionLabel,
    onErrorAction,
    loaderSize = LoaderSize.MD,
    emptyStateTitle,
    emptyStateDescription,
    emptyStateIcon,
    getRowKey,
    onRowClick,
    actionsLabel,
    renderRowActions,
}: DataTableProps<TRow>): JSX.Element {
    if (loading) {
        return (
            <div class="flex justify-center py-10">
                <Loader size={loaderSize} />
            </div>
        );
    }

    if (errorTitle) {
        return (
            <ErrorState
                title={errorTitle}
                description={errorDescription}
                actionLabel={errorActionLabel}
                onAction={onErrorAction}
            />
        );
    }

    if (rows.length === 0) {
        return <EmptyState title={emptyStateTitle} description={emptyStateDescription} icon={emptyStateIcon} />;
    }

    return (
        <Table
            columns={columns}
            rows={rows}
            getRowKey={getRowKey}
            onRowClick={onRowClick}
            actionsLabel={actionsLabel}
            renderRowActions={renderRowActions}
        />
    );
}

