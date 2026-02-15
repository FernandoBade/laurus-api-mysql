import type { JSX } from "preact";
import { IconName } from "@shared/enums/icon.enums";
import { ButtonVariant } from "@shared/enums/ui.enums";
import { Button } from "@/components/button/button";
import { Card } from "@/components/card/card";
import { Icon } from "@/components/icon/icon";
import type { ErrorStateProps } from "@/components/error-state/error-state.types";
import { t } from "@/utils/i18n/translate";

/**
 * @summary Renders a reusable translated error-state block.
 * @param props Error-state configuration.
 * @returns Error-state component.
 */
export function ErrorState({
    title,
    description,
    icon = IconName.WARNING,
    actionLabel,
    onAction,
}: ErrorStateProps): JSX.Element {
    return (
        <Card>
            <div class="flex flex-col items-center gap-3 py-4 text-center">
                <Icon name={icon} size={28} />
                <h3 class="text-section-title">{t(title)}</h3>
                {description ? <p class="text-body text-base-content/70">{t(description)}</p> : null}
                {actionLabel && onAction ? (
                    <div class="w-full sm:w-auto [&>button]:w-full sm:[&>button]:w-auto">
                        <Button variant={ButtonVariant.OUTLINE} label={actionLabel} onClick={onAction} />
                    </div>
                ) : null}
            </div>
        </Card>
    );
}
