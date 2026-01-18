export type QueryParams = Record<string, string | number | boolean | undefined>;

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
  elapsedTime?: number | string;
};

export type ApiFailure = {
  success: false;
  data?: undefined;
  error?: unknown;
  message?: string;
  elapsedTime?: number | string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type ApiListResponse<T> = ApiResponse<T[]> & {
  page?: number;
  pageSize?: number;
  pageCount?: number;
  totalItems?: number;
  meta?: Record<string, unknown>;
};

export type ApiValidationError = {
  property: string;
  error: string;
};
