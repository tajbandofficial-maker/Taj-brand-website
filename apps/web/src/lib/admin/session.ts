/** Admin session cookie helpers (edge-safe: no Node APIs, no secrets). */

export const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || "tb_session";
export const SESSION_MAX_AGE = 8 * 60 * 60; // matches the API's JWT lifetime

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge,
  };
}

/**
 * Reads `exp` from a JWT without verifying it. Only used to skip obviously
 * expired sessions — the API verifies the signature on every BFF call.
 */
export function isTokenExpired(token: string, nowSeconds = Date.now() / 1000): boolean {
  const payload = token.split(".")[1];
  if (!payload) return true;
  try {
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as {
      exp?: number;
    };
    return typeof json.exp !== "number" || json.exp <= nowSeconds;
  } catch {
    return true;
  }
}
