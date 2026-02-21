import type { ResourceKey } from "@shared/i18n/resource.keys";

interface ApiResponseMeta {
    error?: unknown;
    page?: number;
    pageSize?: number;
    totalItems?: number;
    pageCount?: number;
}

export type ApiErrorResponse = ApiResponseMeta & {
    success: false;
    resource: ResourceKey;
    message: string;
    data?: never;
};

export type ApiSuccessResponse<T> = ApiResponseMeta & {
    success: true;
    data?: T;
    resource?: ResourceKey;
    message?: string;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
