import { describe, expect, test } from "vitest";
import {
  ApiClientError,
  getApiErrorFromPayload,
  getApiErrorMessage,
  normalizeApiError,
} from "./errors";

describe("api error normalization", () => {
  test("maps validation errors to ApiClientError details", () => {
    const error = getApiErrorFromPayload(
      {
        message: "Validation failed",
        error: [{ property: "name", error: "Name is required" }],
      },
      400
    );

    expect(error).toBeInstanceOf(ApiClientError);
    expect(error.kind).toBe("validation");
    expect(error.details).toEqual([
      { property: "name", error: "Name is required" },
    ]);
    expect(getApiErrorMessage(error, "fallback")).toBe("Name is required");
  });

  test("normalizes generic errors", () => {
    const normalized = normalizeApiError(new Error("Boom"));
    expect(normalized).toBeInstanceOf(ApiClientError);
    expect(normalized.message).toBe("Boom");
    expect(normalized.kind).toBe("unknown");
  });
});
