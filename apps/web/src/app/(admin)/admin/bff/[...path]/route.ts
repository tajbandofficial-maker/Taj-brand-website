import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/admin/session";
import { env } from "@/lib/env";

/**
 * BFF: the admin UI calls /admin/bff/<path>; this forwards to the private API
 * at /admin/<path> with the session token as a Bearer header (§6.7).
 */

const SEGMENT = /^[A-Za-z0-9_-]+$/;

async function forward(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  // Every segment must be a plain identifier: no "..", encoded slashes or dots,
  // so the request can never leave the API's /admin prefix.
  if (path.length === 0 || !path.every((s) => SEGMENT.test(s))) {
    return NextResponse.json(
      { statusCode: 400, message: "Invalid path", error: "Bad Request" },
      { status: 400 },
    );
  }

  // CSRF defence in depth (the cookie is already SameSite=Strict).
  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    if (origin && origin !== request.nextUrl.origin) {
      return NextResponse.json(
        { statusCode: 403, message: "Bad origin", error: "Forbidden" },
        { status: 403 },
      );
    }
  }

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token)
    return NextResponse.json(
      { statusCode: 401, message: "Not signed in", error: "Unauthorized" },
      { status: 401 },
    );

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const upstream = await fetch(
    `${env.API_INTERNAL_URL}/admin/${path.join("/")}${request.nextUrl.search}`,
    {
      method: request.method,
      headers: {
        authorization: `Bearer ${token}`,
        ...(hasBody ? { "content-type": "application/json" } : {}),
      },
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
    },
  ).catch(() => null);

  if (!upstream) {
    return NextResponse.json(
      { statusCode: 503, message: "API unavailable", error: "Service Unavailable" },
      { status: 503 },
    );
  }

  const response = new NextResponse(upstream.body, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  });
  // Expired or invalid token: clear it so the client is sent to the login page.
  if (upstream.status === 401) response.cookies.set(SESSION_COOKIE, "", sessionCookieOptions(0));
  return response;
}

export { forward as DELETE, forward as GET, forward as PATCH, forward as POST, forward as PUT };
