import type { JSX } from "preact";
import type { TableProps } from "@/components/table/table.types";
import { classNames } from "@/utils/classNames";
import { t } from "@/utils/i18n/translate";

/**
 * @summary Renders a generic typed table structure.
 * @param props Table configuration.
 * @returns Table component.
 */
export function Table<TRow>({
    columns,
    rows,
    getRowKey,
    onRowClick,
    actionsLabel,
    renderRowActions,
}: TableProps<TRow>): JSX.Element {
    const hasActionsColumn = Boolean(renderRowActions);

    return (
        <div class="overflow-x-auto rounded-box border border-base-300">
            <table class="table table-zebra w-full min-w-[42rem] text-sm sm:text-base">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key} class="whitespace-nowrap text-xs font-semibold text-base-content/70 sm:text-sm">
                                {t(column.header)}
                            </th>
                        ))}
                        {hasActionsColumn && actionsLabel ? <th class="whitespace-nowrap text-xs font-semibold text-base-content/70 sm:text-sm">{t(actionsLabel)}</th> : null}
                        {hasActionsColumn && !actionsLabel ? <th /> : null}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr
                            key={getRowKey ? getRowKey(row, rowIndex) : String(rowIndex)}
                            class={classNames(onRowClick ? "cursor-pointer" : undefined)}
                            onClick={onRowClick ? () => onRowClick(row) : undefined}
                        >
                            {columns.map((column) => (
                                <td key={column.key} class="align-top whitespace-normal break-words">
                                    {column.render(row, rowIndex)}
                                </td>
                            ))}
                            {hasActionsColumn ? (
                                <td
                                    class="align-top"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                    }}
                                >
                                    <div class="flex max-w-full flex-wrap items-center gap-2">
                                        {renderRowActions?.(row, rowIndex)}
                                    </div>
                                </td>
                            ) : null}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

