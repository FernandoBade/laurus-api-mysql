import type { JSX } from "preact";
import type { BulletsProps } from "@/components/bullets/bullets.types";
import { t } from "@/utils/i18n/translate";

/**
 * @summary Renders translated list bullets.
 * @param props Bullets configuration.
 * @returns Ordered/unordered list or null for empty input.
 */
export function Bullets({ items, ordered = false }: BulletsProps): JSX.Element | null {
    if (items.length === 0) {
        return null;
    }

    if (ordered) {
        return (
            <ol class="list-decimal space-y-1 pl-5 text-sm">
                {items.map((item) => (
                    <li key={item}>{t(item)}</li>
                ))}
            </ol>
        );
    }

    return (
        <ul class="list-disc space-y-1 pl-5 text-sm">
            {items.map((item) => (
                <li key={item}>{t(item)}</li>
            ))}
        </ul>
    );
}
