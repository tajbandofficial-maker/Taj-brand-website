import { NextResponse } from "next/server";

import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/admin/session";
import { env } from "@/lib/env";

/** POST { email, password } → calls Nest /auth/login → sets the httpOnly session cookie. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    password?: unknown;
  } | null;
  if (typeof body?.email !== "string" || typeof body.password !== "string") {
    return NextResponse.json({ message: "Enter your email and password." }, { status: 400 });
  }

  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const res = await fetch(`${env.API_INTERNAL_URL}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(ip ? { "cf-connecting-ip": ip } : {}) },
    body: JSON.stringify({ email: body.email, password: body.password }),
    cache: "no-store",
  }).catch(() => null);

  // API down, or up without its database: not the visitor's credentials.
  if (!res || res.status >= 500) {
    return NextResponse.json(
      { message: "The server is unavailable. Please try again." },
      { status: 503 },
    );
  }
  if (res.status === 429) {
    return NextResponse.json(
      { message: "Too many attempts. Wait a minute and try again." },
      { status: 429 },
    );
  }
  if (!res.ok) {
    // Generic on purpose: never reveal whether the email exists.
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }

  const { accessToken } = (await res.json()) as { accessToken: string };
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, accessToken, sessionCookieOptions());
  return response;
}
