import type { ResourceKey } from "@shared/i18n/resource.keys";

export interface ApiResponse<T> {
    success: boolean;
    resource?: ResourceKey;
    message?: string;
    data?: T;
    error?: unknown;
    page?: number;
    pageSize?: number;
    totalItems?: number;
    pageCount?: number;
}
