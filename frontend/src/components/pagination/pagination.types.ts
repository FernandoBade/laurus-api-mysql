/**
 * @summary Typed pagination props.
 */
export interface PaginationProps {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly onPageChange: (page: number) => void;
}
