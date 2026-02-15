import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { Icon } from "@/components/icon/icon";
import type { AlertProps } from "@/components/alert/alert.types";
import { getStatusVariantClass, getStatusVariantIcon } from "@/components/status/status-variant";
import { AlertDirection, AlertStyle, AlertVariant } from "@shared/enums/ui.enums";
import { classNames } from "@/utils/classNames";
import { t } from "@/utils/i18n/translate";

type AlertToneClassMap = Record<Exclude<AlertStyle, AlertStyle.SOLID>, string>;

const ALERT_STYLE_CLASS_MAP: Record<AlertStyle, string | undefined> = {
    [AlertStyle.SOLID]: undefined,
    [AlertStyle.OUTLINE]: "alert-outline",
    [AlertStyle.DASH]: "alert-dash",
    [AlertStyle.SOFT]: "alert-soft",
};

const ALERT_TONE_FALLBACK_CLASS_MAP: Record<AlertVariant, AlertToneClassMap> = {
    [AlertVariant.INFO]: {
        [AlertStyle.OUTLINE]: "bg-transparent border-info text-info",
        [AlertStyle.DASH]: "bg-transparent border-info border-dashed text-info",
        [AlertStyle.SOFT]: "bg-info/15 border-info/35 text-info",
    },
    [AlertVariant.SUCCESS]: {
        [AlertStyle.OUTLINE]: "bg-transparent border-success text-success",
        [AlertStyle.DASH]: "bg-transparent border-success border-dashed text-success",
        [AlertStyle.SOFT]: "bg-success/15 border-success/35 text-success",
    },
    [AlertVariant.WARNING]: {
        [AlertStyle.OUTLINE]: "bg-transparent border-warning text-warning",
        [AlertStyle.DASH]: "bg-transparent border-warning border-dashed text-warning",
        [AlertStyle.SOFT]: "bg-warning/15 border-warning/35 text-warning",
    },
    [AlertVariant.ERROR]: {
        [AlertStyle.OUTLINE]: "bg-transparent border-error text-error",
        [AlertStyle.DASH]: "bg-transparent border-error border-dashed text-error",
        [AlertStyle.SOFT]: "bg-error/15 border-error/35 text-error",
    },
};

const ALERT_NEUTRAL_FALLBACK_CLASS_MAP: Record<Exclude<AlertStyle, AlertStyle.SOLID>, string> = {
    [AlertStyle.OUTLINE]: "bg-transparent border-base-content/20",
    [AlertStyle.DASH]: "bg-transparent border-base-content/20 border-dashed",
    [AlertStyle.SOFT]: "bg-base-200 border-base-300",
};

const ALERT_DIRECTION_CLASS_MAP: Record<AlertDirection, string> = {
    [AlertDirection.HORIZONTAL]: "alert-horizontal",
    [AlertDirection.VERTICAL]: "alert-vertical",
    [AlertDirection.RESPONSIVE]: "alert-vertical sm:alert-horizontal",
};

const ALERT_DIRECTION_FALLBACK_CLASS_MAP: Record<AlertDirection, string> = {
    [AlertDirection.HORIZONTAL]: "grid-flow-col [grid-template-columns:auto_minmax(auto,1fr)] justify-items-start text-start",
    [AlertDirection.VERTICAL]: "grid-flow-row [grid-template-columns:none] justify-items-center text-center sm:grid-flow-row sm:[grid-template-columns:none] sm:justify-items-center sm:text-center",
    [AlertDirection.RESPONSIVE]: "grid-flow-row [grid-template-columns:none] justify-items-center text-center sm:grid-flow-col sm:[grid-template-columns:auto_minmax(auto,1fr)] sm:justify-items-start sm:text-start",
};

const RESPONSIVE_HORIZONTAL_MIN_WIDTH = 420;

/**
 * @summary Renders a typed alert that supports DaisyUI style and layout options.
 * @param props Alert configuration.
 * @returns Alert component.
 */
export function Alert({
    variant,
    style = AlertStyle.SOLID,
    direction,
    message,
    title,
    description,
    icon,
    hideIcon = false,
    actions,
    children,
    compact = false,
}: AlertProps): JSX.Element {
    const alertRef = useRef<HTMLDivElement>(null);
    const [isCompactLayout, setIsCompactLayout] = useState<boolean>(false);
    const [hasMeasuredLayout, setHasMeasuredLayout] = useState<boolean>(false);

    useEffect(() => {
        if (direction !== AlertDirection.RESPONSIVE) {
            setIsCompactLayout(false);
            setHasMeasuredLayout(false);
            return;
        }

        const element = alertRef.current;

        if (!element || typeof ResizeObserver === "undefined") {
            return;
        }

        const applyLayout = (width: number): void => {
            setHasMeasuredLayout(true);
            setIsCompactLayout(width < RESPONSIVE_HORIZONTAL_MIN_WIDTH);
        };

        applyLayout(element.getBoundingClientRect().width);

        const observer = new ResizeObserver((entries) => {
            const nextWidth = entries[0]?.contentRect.width ?? element.getBoundingClientRect().width;
            applyLayout(nextWidth);
        });

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [direction]);

    const resolvedDirection =
        direction === AlertDirection.RESPONSIVE && hasMeasuredLayout
            ? (isCompactLayout ? AlertDirection.VERTICAL : AlertDirection.HORIZONTAL)
            : direction;
    const isVerticalLayout = resolvedDirection === AlertDirection.VERTICAL;

    const resolvedVariantClass = variant && style === AlertStyle.SOLID ? getStatusVariantClass(variant) : undefined;
    const resolvedStyleFallbackClass =
        style === AlertStyle.SOLID
            ? undefined
            : variant
                ? ALERT_TONE_FALLBACK_CLASS_MAP[variant][style]
                : ALERT_NEUTRAL_FALLBACK_CLASS_MAP[style];
    const resolvedMessage = message ? t(message) : undefined;
    const resolvedTitle = title ? t(title) : undefined;
    const resolvedDescription = description ? t(description) : undefined;
    const resolvedIcon = icon ?? (variant ? getStatusVariantIcon(variant) : undefined);
    const shouldRenderIcon = !hideIcon && Boolean(resolvedIcon);
    const usesStructuredContent = Boolean(resolvedTitle || resolvedDescription);
    const hasPrimitiveChildren = typeof children === "string" || typeof children === "number";
    const normalizedChildren = hasPrimitiveChildren ? <span class="text-body font-ui">{children}</span> : children;

    const content = normalizedChildren ?? (
        usesStructuredContent ? (
            <div class="space-y-1 font-ui">
                {resolvedTitle ? <p class="text-label font-semibold leading-tight">{resolvedTitle}</p> : null}
                {resolvedDescription ? <p class="text-body opacity-80">{resolvedDescription}</p> : null}
                {resolvedMessage && resolvedMessage !== resolvedDescription ? <p class="text-body opacity-80">{resolvedMessage}</p> : null}
            </div>
        ) : (
            resolvedMessage ? <span class="text-body font-ui">{resolvedMessage}</span> : null
        )
    );

    return (
        <div
            class={classNames(
                "alert font-ui text-body",
                resolvedVariantClass,
                ALERT_STYLE_CLASS_MAP[style],
                resolvedStyleFallbackClass,
                resolvedDirection ? ALERT_DIRECTION_CLASS_MAP[resolvedDirection] : undefined,
                resolvedDirection ? ALERT_DIRECTION_FALLBACK_CLASS_MAP[resolvedDirection] : undefined,
                compact ? "py-2" : undefined
            )}
            role="alert"
            ref={alertRef}
        >
            {shouldRenderIcon && resolvedIcon ? <Icon name={resolvedIcon} /> : null}
            {content ? <div class={classNames(actions ? "flex-1" : undefined, isVerticalLayout ? "w-full" : undefined)}>{content}</div> : null}
            {actions ? (
                <div
                    class={classNames(
                        "shrink-0 max-w-full",
                        isVerticalLayout ? "w-full" : undefined,
                        isVerticalLayout ? "flex flex-col gap-2" : "flex flex-wrap items-center justify-end gap-2",
                        "[&>div]:max-w-full",
                        isVerticalLayout
                            ? "[&>div]:flex [&>div]:w-full [&>div]:flex-col [&>div]:gap-2"
                            : "[&>div]:flex [&>div]:flex-wrap [&>div]:items-center [&>div]:justify-end [&>div]:gap-2"
                    )}
                >
                    {actions}
                </div>
            ) : null}
        </div>
    );
}
