import type { JSX } from "preact";
import type { FormGridColumns, FormGridProps } from "@/components/form-grid/form-grid.types";
import { classNames } from "@/utils/classNames";

const columnMap: Record<FormGridColumns, string> = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
};

/**
 * @summary Renders responsive form field grids using typed column presets.
 * @param props Grid configuration.
 * @returns Grid container.
 */

export function FormGrid({ columns = 2, children }: FormGridProps): JSX.Element {
    return <div class={classNames("grid grid-cols-1 gap-4", columnMap[columns])}>{children}</div>;
}
