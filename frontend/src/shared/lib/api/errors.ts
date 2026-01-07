import { AxiosError } from "axios";
import type { ApiValidationError } from "@/shared/types/api";

export type ApiErrorKind =
  | "network"
  | "unauthorized"
  | "validation"
  | "http"
  | "unknown";

type ApiErrorPayload = {
  message?: string;
  error?: unknown;
};

type ApiErrorInit = {
  message: string;
  kind: ApiErrorKind;
  status?: number;
  details?: ApiValidationError[];
  code?: string;
  data?: Record<string, unknown>;
};

export class ApiClientError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly details?: ApiValidationError[];
  readonly code?: string;
  readonly data?: Record<string, unknown>;

  constructor({ message, kind, status, details, code, data }: ApiErrorInit) {
    super(message);
    this.name = "ApiClientError";
    this.kind = kind;
    this.status = status;
    this.details = details;
    this.code = code;
    this.data = data;
  }
}

const isAxiosError = (error: unknown): error is AxiosError<ApiErrorPayload> =>
  Boolean(error) && (error as AxiosError).isAxiosError === true;

const coercePayload = (payload: unknown): ApiErrorPayload | undefined => {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }
  return payload as ApiErrorPayload;
};

const extractMessage = (payload?: ApiErrorPayload) => {
  if (!payload) {
    return undefined;
  }
  if (typeof payload.message === "string" && payload.message) {
    return payload.message;
  }
  if (typeof payload.error === "string" && payload.error) {
    return payload.error;
  }
  if (payload.error && typeof payload.error === "object") {
    const message = (payload.error as { message?: string }).message;
    if (message) {
      return message;
    }
  }
  return undefined;
};

const extractErrorData = (
  payload?: ApiErrorPayload
): Record<string, unknown> | undefined => {
  if (!payload || !payload.error || typeof payload.error !== "object") {
    return undefined;
  }
  return payload.error as Record<string, unknown>;
};

const extractErrorCode = (payload?: ApiErrorPayload) => {
  const data = extractErrorData(payload);
  if (data && typeof data.code === "string") {
    return data.code;
  }
  return undefined;
};

const extractValidationErrors = (payload?: ApiErrorPayload): ApiValidationError[] => {
  if (!payload) {
    return [];
  }
  if (!Array.isArray(payload.error)) {
    return [];
  }
  return payload.error
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const candidate = item as ApiValidationError & { message?: string };
      if (typeof candidate.property === "string" && typeof candidate.error === "string") {
        return { property: candidate.property, error: candidate.error };
      }
      if (typeof candidate.property === "string" && typeof candidate.message === "string") {
        return { property: candidate.property, error: candidate.message };
      }
      return null;
    })
    .filter((item): item is ApiValidationError => Boolean(item));
};

export const getApiErrorFromPayload = (
  payload: unknown,
  status?: number,
  fallbackMessage = "Request failed."
) => {
  const normalized = coercePayload(payload);
  const details = extractValidationErrors(normalized);
  const message = extractMessage(normalized) ?? fallbackMessage;
  const data = extractErrorData(normalized);
  const code = extractErrorCode(normalized);
  const kind =
    details.length > 0
      ? "validation"
      : status === 401
      ? "unauthorized"
      : "http";
  return new ApiClientError({
    message,
    kind,
    status,
    details: details.length > 0 ? details : undefined,
    data,
    code,
  });
};

export const normalizeApiError = (
  error: unknown,
  fallbackMessage = "Request failed."
) => {
  if (error instanceof ApiClientError) {
    return error;
  }
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const payload = error.response?.data;
    const details = extractValidationErrors(payload);
    const message =
      extractMessage(payload) ??
      error.message ??
      fallbackMessage;
    const data = extractErrorData(payload);
    const code = extractErrorCode(payload);
    const kind =
      details.length > 0
        ? "validation"
        : status === 401
        ? "unauthorized"
        : error.code === "ERR_NETWORK"
        ? "network"
        : "http";
    return new ApiClientError({
      message,
      kind,
      status,
      details: details.length > 0 ? details : undefined,
      data,
      code,
    });
  }
  if (error instanceof Error) {
    return new ApiClientError({
      message: error.message || fallbackMessage,
      kind: "unknown",
    });
  }
  return new ApiClientError({ message: fallbackMessage, kind: "unknown" });
};

export const getApiValidationErrors = (error: unknown) => {
  const normalized = normalizeApiError(error);
  return normalized.details ?? [];
};

export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage = ""
) => {
  const normalized = normalizeApiError(
    error,
    fallbackMessage || "Request failed."
  );
  if (normalized.details && normalized.details.length > 0) {
    return normalized.details[0].error;
  }
  return normalized.message || fallbackMessage;
};
