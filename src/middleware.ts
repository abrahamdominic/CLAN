import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isMaintenanceEnabled } from "@/lib/maintenance";
import { isStaffUser } from "@/lib/admin-auth";

// Simple in-memory rate limiter (per-process). For multi-instance production,
// swap this for a Redis/Upstash-based implementation.
const attempts = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  // Keep the map from growing without bound under heavy traffic by pruning
  // expired entries once it gets large.
  if (attempts.size > 10_000) {
    for (const [key, value] of attempts) {
      if (now > value.resetAt) attempts.delete(key);
    }
  }
  return entry.count <= max;
}

// Form endpoints that should be rate limited.
const FORM_PATHS = new Set([
  "/give",
  "/join",
  "/prayer",
  "/contact",
  "/testimonies",
  "/discipleship",
]);

function unauthorizedJson() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function forbiddenJson() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Rate limit admin login submissions
  if (request.method === "POST" && request.nextUrl.pathname === "/admin/login") {
    if (!rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
      return new NextResponse("Too many attempts. Please try again later.", { status: 429 });
    }
  }

  // Rate limit public form submissions (server actions POST to the page path)
  if (
    request.method === "POST" &&
    (FORM_PATHS.has(request.nextUrl.pathname) ||
      request.nextUrl.pathname.startsWith("/api/newsletter") ||
      request.nextUrl.pathname.startsWith("/newsletter"))
  ) {
    if (!rateLimit(`form:${ip}`, 20, 60 * 1000)) {
      return new NextResponse("Too many requests. Please slow down.", { status: 429 });
    }
  }

  // Maintenance mode: keep API routes (webhooks) and /admin working so payments
  // still get recorded and admins can take the site back online.
  const { pathname } = request.nextUrl;
  if (
    pathname !== "/maintenance" &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api")
  ) {
    try {
      if (await isMaintenanceEnabled()) {
        const response = NextResponse.rewrite(new URL("/maintenance", request.url));
        response.headers.set("x-robots-tag", "noindex");
        return response;
      }
    } catch {
      // If the maintenance check itself fails, serve the site normally.
    }
  }

  if (!url || !anonKey) {
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (pathname.startsWith("/api/admin")) {
      return unauthorizedJson();
    }
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminPageRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  // Admin API routes are NOT covered by the page middleware by default, so we
  // enforce authentication + staff role here. The admin API uses the service
  // role client (which bypasses RLS), so role verification is essential.
  if (pathname.startsWith("/api/admin")) {
    if (!user) return unauthorizedJson();
    if (!(await isStaffUser(user.id))) return forbiddenJson();
    return NextResponse.next();
  }

  if (isAdminPageRoute) {
    if (isLoginPage) {
      if (user) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return supabaseResponse;
    }
    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    // The dashboard itself is only meaningful for staff. Non-staff sessions are
    // redirected to login so role-based data stays protected.
    if (!(await isStaffUser(user.id))) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|maintenance).*)",
  ],
};