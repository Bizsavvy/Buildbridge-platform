import { NextResponse, type NextRequest } from "next/server";

/**
 * DEMO MODE MIDDLEWARE
 *
 * In demo mode, we skip all Supabase session logic entirely.
 * We only check for the demo session cookie to protect routes.
 *
 * To re-enable real Supabase middleware:
 *   1. Set DEMO_MODE to false
 *   2. Uncomment the Supabase imports and logic below
 */

// ─── DEMO MODE FLAG ────────────────────────────────────────────────────────────
const DEMO_MODE = false;
// ────────────────────────────────────────────────────────────────────────────────

// import { createServerClient } from "@supabase/ssr"; // Re-enable for real Supabase

/**
 * Paths that require an authenticated session.
 * Unauthenticated users hitting these routes are redirected to /signup.
 */
const PROTECTED_PATHS = ["/dashboard", "/admin"];

export default async function middleware(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  if (DEMO_MODE) {
    // ── Demo Mode: Only check for demo cookie ─────────────────────────────
    const { pathname } = request.nextUrl;
    const isProtected = PROTECTED_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    const demoSession = request.cookies.get("buildbridge_demo_session");
    const isDemoAuthenticated = !!demoSession?.value;

    if (isProtected && !isDemoAuthenticated) {
      const signupUrl = request.nextUrl.clone();
      signupUrl.pathname = "/signup";
      signupUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(signupUrl);
    }

    return supabaseResponse;
  }

  // ── Real Supabase Middleware (re-enable later) ────────────────────────────
  // Uncomment this block when switching back to real Supabase:
  /*
  const { createServerClient } = await import("@supabase/ssr");

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  const demoSession = request.cookies.get("buildbridge_demo_session");
  const isDemoAuthenticated = !!demoSession?.value;

  if (isProtected && !user && !isDemoAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
  */

  return supabaseResponse;
}

/**
 * Matcher — run middleware on all routes except static assets
 * and Next.js internals.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
