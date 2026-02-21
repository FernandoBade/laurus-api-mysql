function toBase64Url(value: string): string {
    return Buffer.from(value, "utf8")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

/**
 * @summary Creates a deterministic JWT-like token with the provided payload.
 * @param payload JSON payload object to encode in the token body.
 * @returns Encoded token string suitable for tests.
 */
export function makeAccessToken(payload: Record<string, unknown>): string {
    const header = toBase64Url(JSON.stringify({ alg: "none", typ: "JWT" }));
    const body = toBase64Url(JSON.stringify(payload));
    return `${header}.${body}.signature`;
}
