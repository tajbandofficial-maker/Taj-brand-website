import "server-only";

import { env } from "@/lib/env";

/** Visitor IP for the API's per-IP rate limits. */
export function visitorIp(request: Request): string | undefined {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    undefined
  );
}

/** POSTs JSON to a public Nest /auth/* endpoint. null when the API can't be reached. */
export function postToAuthApi(request: Request, path: string, body: unknown) {
  const ip = visitorIp(request);
  return fetch(`${env.API_INTERNAL_URL}/auth/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(ip ? { "cf-connecting-ip": ip } : {}) },
    body: JSON.stringify(body),
    cache: "no-store",
  }).catch(() => null);
}
