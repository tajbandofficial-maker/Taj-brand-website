import type { ApiErrorBody } from "@taj/types";

/** Error from the admin API, with field-level messages when validation failed. */
export class AdminApiError extends Error {
  constructor(
    readonly status: number,
    readonly messages: string[],
  ) {
    super(messages.join(" ") || `Request failed (${status})`);
    this.name = "AdminApiError";
  }
}

type Options = { method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"; body?: unknown };

/** Browser → Next BFF (/admin/bff/*) → NestJS /admin/*. */
export async function bff<T>(path: string, { method = "GET", body }: Options = {}): Promise<T> {
  const res = await fetch(`/admin/bff/${path.replace(/^\//, "")}`, {
    method,
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  if (res.status === 401) {
    // Session expired: back to the login page, then return here.
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    // Full reload on purpose: drops all cached admin data along with the dead session.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/admin/login?next=${next}`;
    throw new AdminApiError(401, ["Your session has expired. Please sign in again."]);
  }
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as ApiErrorBody | null;
    const msg = err?.message ?? `Request failed (${res.status})`;
    throw new AdminApiError(res.status, Array.isArray(msg) ? msg : [msg]);
  }
  return (await res.json()) as T;
}

/**
 * Maps class-validator messages ("slug must be …") onto form fields by their
 * leading property name; anything unmatched is returned as `rest`.
 */
export function splitFieldErrors(
  messages: string[],
  fields: string[],
): { fieldErrors: Record<string, string>; rest: string[] } {
  const fieldErrors: Record<string, string> = {};
  const rest: string[] = [];
  for (const m of messages) {
    const field = m.split(/[\s.]/)[0] ?? "";
    if (fields.includes(field) && !fieldErrors[field]) {
      fieldErrors[field] = m.charAt(0).toUpperCase() + m.slice(1);
    } else {
      rest.push(m);
    }
  }
  return { fieldErrors, rest };
}
