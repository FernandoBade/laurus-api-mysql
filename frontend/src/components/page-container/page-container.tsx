import type { JSX } from "preact";
import type { PageContainerProps } from "@/components/page-container/page-container.types";

/**
 * @summary Provides consistent responsive page spacing and max width.
 * @param props Page container configuration.
 * @returns Page container component.
 */
export function PageContainer({ children }: PageContainerProps): JSX.Element {
    return <section class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</section>;
}

