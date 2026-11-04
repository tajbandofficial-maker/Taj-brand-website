import { NextResponse } from "next/server";

import { postToAuthApi } from "@/lib/admin/forward-auth";

/** POST { email } → Nest /auth/forgot-password, which emails a reset link to the official inbox. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
  if (typeof body?.email !== "string" || !/^\S+@\S+\.\S+$/.test(body.email)) {
    return NextResponse.json({ message: "Enter your admin email address." }, { status: 400 });
  }

  const res = await postToAuthApi(request, "forgot-password", { email: body.email.trim() });
  if (!res || res.status >= 500) {
    return NextResponse.json(
      { message: "The server is unavailable. Please try again." },
      { status: 503 },
    );
  }
  if (res.status === 429) {
    return NextResponse.json(
      { message: "Too many requests. Wait a few minutes and try again." },
      { status: 429 },
    );
  }
  // Same answer whether or not the email has an account.
  return NextResponse.json({ ok: true });
}
