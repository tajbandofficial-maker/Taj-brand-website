import { timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { env } from "@/lib/env";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/**
 * Internal only: called by NestJS after admin edits (§4.4). Blocked at Caddy
 * for outside traffic and secret-checked here.
 *
 * `expire: 0` makes the next request wait for fresh data instead of serving
 * stale-while-revalidate — otherwise Cloudflare, purged right after this call,
 * would re-cache the stale HTML.
 */
export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret") ?? "";
  if (!safeEqual(secret, env.REVALIDATE_SECRET)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = Array.isArray(body?.tags)
    ? body.tags.filter((t): t is string => typeof t === "string" && t.length > 0 && t.length <= 256)
    : [];
  if (tags.length === 0) return NextResponse.json({ message: "No tags" }, { status: 400 });

  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ revalidated: tags });
}
