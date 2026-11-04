import { NextResponse } from "next/server";

import { postToAuthApi } from "@/lib/admin/forward-auth";

/** POST { token, password } → Nest /auth/reset-password. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    token?: unknown;
    password?: unknown;
  } | null;
  if (typeof body?.token !== "string" || typeof body.password !== "string") {
    return NextResponse.json({ message: "Missing reset link or password." }, { status: 400 });
  }
  if (body.password.length < 8) {
    return NextResponse.json(
      { message: "Use at least 8 characters for the new password." },
      { status: 400 },
    );
  }

  const res = await postToAuthApi(request, "reset-password", {
    token: body.token,
    password: body.password,
  });
  if (!res || res.status >= 500) {
    return NextResponse.json(
      { message: "The server is unavailable. Please try again." },
      { status: 503 },
    );
  }
  if (res.status === 429) {
    return NextResponse.json(
      { message: "Too many attempts. Wait a few minutes and try again." },
      { status: 429 },
    );
  }
  if (!res.ok) {
    return NextResponse.json(
      { message: "This reset link is invalid or has expired. Ask for a new one." },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true });
}
