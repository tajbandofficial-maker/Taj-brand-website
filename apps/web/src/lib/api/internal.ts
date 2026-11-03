import "server-only";

import type { ApiErrorBody } from "@taj/types";

import { env } from "@/lib/env";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type FetchInit = RequestInit & { next?: { tags?: string[]; revalidate?: number | false } };

/** Server-only fetch to the internal NestJS API; throws ApiError on non-2xx. */
export async function apiFetch<T>(path: string, init: FetchInit = {}): Promise<T> {
  const res = await fetch(`${env.API_INTERNAL_URL}${path}`, {
    ...init,
    headers: { "x-internal-token": env.INTERNAL_API_TOKEN, ...init.headers },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
    const message = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
    throw new ApiError(res.status, message ?? `API ${path} responded ${res.status}`);
  }
  return (await res.json()) as T;
}
