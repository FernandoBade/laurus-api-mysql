import type { JSX } from "preact";
import { IconName } from "@shared/enums/icon.enums";
import { ButtonSize, ButtonVariant } from "@shared/enums/ui.enums";
import { Button } from "@/components/button/button";
import type { PaginationProps } from "@/components/pagination/pagination.types";

type PaginationItem = number | "ellipsis-start" | "ellipsis-end";

function getPaginationItems(currentPage: number, totalPages: number): readonly PaginationItem[] {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const items: PaginationItem[] = [1];
    const windowStart = currentPage <= 3 ? 2 : currentPage >= totalPages - 2 ? totalPages - 3 : currentPage - 1;
    const windowEnd = currentPage <= 3 ? 4 : currentPage >= totalPages - 2 ? totalPages - 1 : currentPage + 1;
    const safeStart = Math.max(2, windowStart);
    const safeEnd = Math.min(totalPages - 1, windowEnd);

    if (safeStart > 2) {
        items.push("ellipsis-start");
    }

    for (let page = safeStart; page <= safeEnd; page += 1) {
        items.push(page);
    }

    if (safeEnd < totalPages - 1) {
        items.push("ellipsis-end");
    }

    items.push(totalPages);
    return items;
}

/**
 * @summary Renders generic pagination controls.
 * @param props Pagination configuration.
 * @returns Pagination component.
 */
export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps): JSX.Element | null {
    if (totalPages <= 1) {
        return null;
    }

    const items = getPaginationItems(currentPage, totalPages);

    return (
        <nav class="flex w-full flex-wrap items-center justify-start gap-2 sm:justify-center">
            <Button
                variant={ButtonVariant.GHOST}
                size={ButtonSize.SM}
                iconLeft={IconName.CHEVRON_LEFT}
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
            />

            {items.map((item, index) => {
                if (typeof item !== "number") {
                    return (
                        <span key={`${item}-${index}`} class="btn btn-disabled btn-ghost btn-sm pointer-events-none" aria-hidden="true">
                            ...
                        </span>
                    );
                }

                return (
                    <Button
                        key={item}
                        variant={item === currentPage ? ButtonVariant.PRIMARY : ButtonVariant.OUTLINE}
                        size={ButtonSize.SM}
                        onClick={() => onPageChange(item)}
                    >
                        {item}
                    </Button>
                );
            })}

            <Button
                variant={ButtonVariant.GHOST}
                size={ButtonSize.SM}
                iconLeft={IconName.CHEVRON_RIGHT}
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            />
        </nav>
    );
}

