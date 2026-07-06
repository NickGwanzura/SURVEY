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

/** Routes exempted from maintenance mode. */
const MAINTENANCE_EXEMPT_PATHS = new Set<string>([
  "/admin/login",
  "/admin/setup",
  "/maintenance",
]);

/** Inline security headers applied to every response. */
const isDev = process.env.NODE_ENV === "development";

function buildCSP(nonce: string): string {
  return [
    "default-src 'self'",
    // Use nonce-based CSP: scripts without the nonce are blocked.
    // `strict-dynamic` automatically propagates trust to scripts loaded by
    // trusted scripts, so we don't need to list CDN origins.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${
      isDev ? " 'unsafe-eval'" : ""
    }`,
    // Inline styles are still allowed for the FontShare API and UI components
    // that inject styles dynamically. Ideally we'd nonce these too.
    "style-src 'self' 'unsafe-inline' https://api.fontshare.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.tile.openstreetmap.org",
    "font-src 'self' data: https://api.fontshare.com",
    "object-src 'none'",
    "frame-src 'none'",
  ].join("; ");
}

function buildSecurityHeaders(nonce: string): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-XSS-Protection": "0", // disables the legacy browser reflect-xss filter
    "Strict-Transport-Security":
      "max-age=31536000; includeSubDomains; preload",
    "Content-Security-Policy": buildCSP(nonce),
  };
}

function applySecurityHeaders(response: NextResponse, nonce: string): NextResponse {
  const headers = buildSecurityHeaders(nonce);
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  // Make the nonce available to server components via the request header
  response.headers.set("x-nonce", nonce);
  return response;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Generate a cryptographically random nonce for this request.
  // Used by the CSP to allow framework inline scripts without unsafe-inline.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // ── www → apex redirect (301) ──────────────────────────────────
  const host = req.headers.get("host") ?? "";
  if (host.startsWith("www.")) {
    const url = req.nextUrl.clone();
    url.host = host.replace(/^www\./, "");
    return NextResponse.redirect(url, { status: 301 });
  }

  // ── Maintenance mode ──────────────────────────────────────────────
  if (process.env.MAINTENANCE_MODE === "true") {
    const isExempt =
      MAINTENANCE_EXEMPT_PATHS.has(pathname) ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/_next/");

    if (!isExempt) {
      const url = req.nextUrl.clone();
      url.pathname = "/maintenance";
      return applySecurityHeaders(NextResponse.redirect(url), nonce);
    }
  }

  // Non-admin routes: apply security headers without auth logic
  if (!pathname.startsWith("/admin")) {
    return applySecurityHeaders(NextResponse.next(), nonce);
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
          return applySecurityHeaders(NextResponse.redirect(url), nonce);
        }
      }
    }
    return applySecurityHeaders(NextResponse.next(), nonce);
  }

  // Protected admin routes: require valid session
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return applySecurityHeaders(NextResponse.redirect(url), nonce);
  }

  const payload = await verifySessionTokenEdge(token);
  if (!payload) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    const res = NextResponse.redirect(url);
    res.cookies.delete(AUTH_COOKIE_NAME);
    return applySecurityHeaders(res, nonce);
  }

  return applySecurityHeaders(NextResponse.next(), nonce);
}
