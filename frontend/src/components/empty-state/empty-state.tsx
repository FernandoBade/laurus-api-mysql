import type { JSX } from "preact";
import { IconName } from "@shared/enums/icon.enums";
import { ButtonVariant } from "@shared/enums/ui.enums";
import { Button } from "@/components/button/button";
import { Card } from "@/components/card/card";
import { Icon } from "@/components/icon/icon";
import type { EmptyStateProps } from "@/components/empty-state/empty-state.types";
import { t } from "@/utils/i18n/translate";

/**
 * @summary Renders a reusable empty-state block.
 * @param props Empty state configuration.
 * @returns Empty state component.
 */
export function EmptyState({
    title,
    description,
    icon = IconName.INFO,
    actionLabel,
    onAction,
}: EmptyStateProps): JSX.Element {
    return (
        <Card>
            <div class="flex flex-col items-center gap-3 py-4 text-center">
                <Icon name={icon} size={28} />
                <h3 class="text-lg font-semibold">{t(title)}</h3>
                {description ? <p class="text-sm text-base-content/70">{t(description)}</p> : null}
                {actionLabel && onAction ? (
                    <div class="w-full sm:w-auto [&>button]:w-full sm:[&>button]:w-auto">
                        <Button variant={ButtonVariant.PRIMARY} label={actionLabel} onClick={onAction} />
                    </div>
                ) : null}
            </div>
        </Card>
    );
}

