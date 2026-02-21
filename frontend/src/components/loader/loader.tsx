import type { JSX } from "preact";
import { LoaderSize } from "@shared/enums/ui.enums";
import type { LoaderProps } from "@/components/loader/loader.types";
import { classNames } from "@/utils/classNames";

const sizeMap: Record<LoaderSize, string> = {
    [LoaderSize.SM]: "loading-sm",
    [LoaderSize.MD]: "loading-md",
    [LoaderSize.LG]: "loading-lg",
};

/**
 * @summary Renders the shared loading indicator in configured sizes.
 * @param props Loader configuration.
 * @returns Loader spinner.
 */

export function Loader({ size = LoaderSize.MD }: LoaderProps): JSX.Element {
    return <span class={classNames("loading loading-spinner", sizeMap[size])} aria-hidden="true" />;
}

