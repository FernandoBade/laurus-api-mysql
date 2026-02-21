import type { JSX } from "preact";
import type { AppLayoutProps } from "@/components/layout/app-layout.types";

/**
 * @summary Renders the application shell with optional header and footer slots.
 * @param props Layout configuration.
 * @returns Layout component.
 */

export function AppLayout({ children, header, footer }: AppLayoutProps): JSX.Element {
    return (
        <div class="min-h-screen bg-base-100 font-ui text-base-content">
            {header ? <header class="border-b border-base-300 bg-base-200">{header}</header> : null}
            <main>{children}</main>
            {footer ? <footer class="border-t border-base-300 bg-base-200">{footer}</footer> : null}
        </div>
    );
}

