export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: unknown;
  elapsedTime?: number | string;
};

export type ApiListResponse<T> = ApiResponse<T[]> & {
  page?: number;
  pageSize?: number;
  pageCount?: number;
  totalItems?: number;
  meta?: Record<string, unknown>;
};
