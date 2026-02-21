import type { JSX } from "preact";
import type { CardProps } from "@/components/card/card.types";
import { classNames } from "@/utils/classNames";
import { t } from "@/utils/i18n/translate";

/**
 * @summary Renders a semantic card container with optional heading and compact mode.
 * @param props Card configuration.
 * @returns Card component.
 */

export function Card({ title, description, children, compact = false }: CardProps): JSX.Element {
    return (
        <article class="card overflow-hidden border border-base-300 bg-base-100 shadow-sm">
            <div class={classNames("card-body min-w-0", compact ? "p-4" : undefined)}>
                {title ? <h2 class="card-title text-card-title">{t(title)}</h2> : null}
                {description ? <p class="text-body text-base-content/70">{t(description)}</p> : null}
                {children}
            </div>
        </article>
    );
}

