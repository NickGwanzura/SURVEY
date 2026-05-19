import { type NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, verifySessionTokenEdge } from "@/lib/auth-edge";

export const config = {
  matcher: ["/admin/:path*"],
};

const PUBLIC_ADMIN_PATHS = new Set<string>(["/admin/login", "/admin/setup"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    // For login: redirect to dashboard if already authenticated.
    // For setup: allow through regardless of auth state.
    if (pathname === "/admin/login") {
      const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
      if (token) {
        const payload = await verifySessionTokenEdge(token);
        if (payload) {
          const url = req.nextUrl.clone();
          url.pathname = "/admin/dashboard";
          return NextResponse.redirect(url);
        }
      }
    }
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const payload = await verifySessionTokenEdge(token);
  if (!payload) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    const res = NextResponse.redirect(url);
    res.cookies.delete(AUTH_COOKIE_NAME);
    return res;
  }

  return NextResponse.next();
}
