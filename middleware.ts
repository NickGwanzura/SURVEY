import { type NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, verifySessionTokenEdge } from "@/lib/auth-edge";

export const config = {
  // Run on all routes except Next.js internal static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

const PUBLIC_ADMIN_PATHS = new Set<string>([
  "/admin/login",
  "/admin/setup",
  "/admin/forgot-password",
  "/admin/reset-password",
]);

/** Inline security headers applied to every response. */
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-XSS-Protection": "0", // disables the legacy browser reflect-xss filter
  "Strict-Transport-Security":
    "max-age=31536000; includeSubDomains; preload",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; connect-src 'self'; font-src 'self' data:; object-src 'none'; frame-src 'none';",
};

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Non-admin routes: apply security headers without auth logic
  if (!pathname.startsWith("/admin")) {
    return applySecurityHeaders(NextResponse.next());
  }

  // Public admin paths (login, setup): no auth required
  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    if (pathname === "/admin/login") {
      const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
      if (token) {
        const payload = await verifySessionTokenEdge(token);
        if (payload) {
          const url = req.nextUrl.clone();
          url.pathname = "/admin/dashboard";
          return applySecurityHeaders(NextResponse.redirect(url));
        }
      }
    }
    return applySecurityHeaders(NextResponse.next());
  }

  // Protected admin routes: require valid session
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  const payload = await verifySessionTokenEdge(token);
  if (!payload) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    const res = NextResponse.redirect(url);
    res.cookies.delete(AUTH_COOKIE_NAME);
    return applySecurityHeaders(res);
  }

  return applySecurityHeaders(NextResponse.next());
}
