import { type NextRequest, NextResponse } from "next/server";

import { isTokenExpired, SESSION_COOKIE } from "@/lib/admin/session";

/**
 * Admin gate (Next 16's renamed middleware). Runs ONLY on /admin so public
 * pages stay cookie-free and edge-cacheable (§4.3). It checks that a
 * non-expired session cookie exists; the API verifies the JWT itself.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const loggedIn = Boolean(token && !isTokenExpired(token));
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return loggedIn ? NextResponse.redirect(new URL("/admin", request.url)) : NextResponse.next();
  }
  if (loggedIn) return NextResponse.next();

  if (pathname.startsWith("/admin/bff/")) {
    return NextResponse.json(
      { statusCode: 401, message: "Not signed in", error: "Unauthorized" },
      { status: 401 },
    );
  }
  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", `${pathname}${search}`);
  const res = NextResponse.redirect(login);
  if (token) res.cookies.delete(SESSION_COOKIE); // expired
  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
