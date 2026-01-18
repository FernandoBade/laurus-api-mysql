type TokenPayload = {
  id?: number;
};

let accessToken: string | null = null;
let userId: number | null = null;

const decodeBase64 = (value: string) => {
  if (typeof atob === "function") {
    return atob(value);
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "base64").toString("utf8");
  }
  return "";
};

const decodeTokenPayload = (token: string): TokenPayload | null => {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }
  const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  try {
    const decoded = decodeBase64(base64);
    return decoded ? (JSON.parse(decoded) as TokenPayload) : null;
  } catch {
    return null;
  }
};

export const getAccessToken = () => accessToken;

export const getUserId = () => userId;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (!token) {
    userId = null;
    return;
  }
  const payload = decodeTokenPayload(token);
  userId = payload?.id ?? null;
};

export const clearAccessToken = () => {
  accessToken = null;
  userId = null;
};
