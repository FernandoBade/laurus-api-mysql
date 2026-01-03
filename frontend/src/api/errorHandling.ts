import { AxiosError } from "axios";

export type ApiValidationError = {
  property: string;
  error: string;
};

type ApiErrorPayload = {
  message?: string;
  error?: unknown;
};

const isAxiosError = (error: unknown): error is AxiosError<ApiErrorPayload> =>
  Boolean(error) && (error as AxiosError).isAxiosError === true;

const getPayload = (error: unknown): ApiErrorPayload | undefined => {
  if (!isAxiosError(error)) {
    return undefined;
  }
  return error.response?.data;
};

export const getApiValidationErrors = (
  error: unknown
): ApiValidationError[] => {
  const payload = getPayload(error);
  if (!payload) {
    return [];
  }
  if (Array.isArray(payload.error)) {
    return payload.error.filter(
      (item): item is ApiValidationError =>
        Boolean(item) &&
        typeof (item as ApiValidationError).property === "string" &&
        typeof (item as ApiValidationError).error === "string"
    );
  }
  return [];
};

export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage = ""
) => {
  const validationErrors = getApiValidationErrors(error);
  if (validationErrors.length > 0) {
    return validationErrors[0].error;
  }

  const payload = getPayload(error);
  if (payload?.message && typeof payload.message === "string") {
    return payload.message;
  }

  if (payload?.error && typeof payload.error === "object") {
    const errorMessage = (payload.error as { message?: string }).message;
    if (errorMessage) {
      return errorMessage;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};
