import { IconName } from "@shared/enums/icon.enums";
import { AlertVariant, ToastVariant } from "@shared/enums/ui.enums";

type StatusVariant = AlertVariant | ToastVariant;

const statusVariantClassMap: Record<StatusVariant, string> = {
    [AlertVariant.INFO]: "alert-info",
    [AlertVariant.SUCCESS]: "alert-success",
    [AlertVariant.WARNING]: "alert-warning",
    [AlertVariant.ERROR]: "alert-error",
};

const statusVariantIconMap: Record<StatusVariant, IconName> = {
    [AlertVariant.INFO]: IconName.INFO,
    [AlertVariant.SUCCESS]: IconName.CHECK,
    [AlertVariant.WARNING]: IconName.WARNING,
    [AlertVariant.ERROR]: IconName.WARNING,
};

/**
 * @summary Resolves DaisyUI status alert class for alert/toast variants.
 * @param variant Typed status variant.
 * @returns DaisyUI variant class name.
 */
export function getStatusVariantClass(variant: StatusVariant): string {
    return statusVariantClassMap[variant];
}

/**
 * @summary Resolves semantic status icon for alert/toast variants.
 * @param variant Typed status variant.
 * @returns Semantic icon enum.
 */
export function getStatusVariantIcon(variant: StatusVariant): IconName {
    return statusVariantIconMap[variant];
}
