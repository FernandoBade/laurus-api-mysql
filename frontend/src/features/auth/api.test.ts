import { beforeEach, describe, expect, test, vi } from "vitest";
import { login, logout, refreshAccessToken } from "./api";
import { apiPost, refreshRequest } from "@/shared/lib/api/client";
import { clearAccessToken, getAccessToken } from "@/shared/lib/auth/session";

vi.mock("@/shared/lib/api/client", () => ({
  apiPost: vi.fn(),
  apiGet: vi.fn(),
  refreshRequest: vi.fn(),
  setRefreshHandler: vi.fn(),
}));

const apiPostMock = vi.mocked(apiPost);
const refreshRequestMock = vi.mocked(refreshRequest);

beforeEach(() => {
  apiPostMock.mockReset();
  refreshRequestMock.mockReset();
  clearAccessToken();
});

describe("auth api", () => {
  test("login posts credentials", async () => {
    apiPostMock.mockResolvedValue({
      success: true,
      data: { token: "token-123" },
    });

    const result = await login({ email: "test@example.com", password: "pw" });

    expect(apiPostMock).toHaveBeenCalledWith("/auth/login", {
      email: "test@example.com",
      password: "pw",
    });
    expect(result.data?.token).toBe("token-123");
  });

  test("refreshAccessToken stores token", async () => {
    refreshRequestMock.mockResolvedValue({
      success: true,
      data: { token: "refresh-456" },
    });

    const token = await refreshAccessToken();

    expect(token).toBe("refresh-456");
    expect(getAccessToken()).toBe("refresh-456");
  });

  test("logout hits endpoint", async () => {
    apiPostMock.mockResolvedValue({ success: true, data: null });

    await logout();

    expect(apiPostMock).toHaveBeenCalledWith("/auth/logout");
  });
});
