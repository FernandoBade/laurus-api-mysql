export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: unknown;
    page?: number;
    pageSize?: number;
    totalItems?: number;
    pageCount?: number;
}
