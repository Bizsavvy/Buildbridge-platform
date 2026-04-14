import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Paths that require an authenticated session.
 * Unauthenticated users hitting these routes are redirected to /login.
 */
const PROTECTED_PATHS = ["/dashboard", "/admin"];

/**
 * Next.js Middleware
 *
 * 1. Refreshes the Supabase auth session on every request so
 *    cookies stay in sync with the server.
 * 2. Redirects unauthenticated users away from protected routes.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Mirror cookie changes onto the request so downstream
          // Server Components / Route Handlers see updated values.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          // Rebuild the response with the modified request and
          // set cookies on the outgoing response as well.
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do NOT use `supabase.auth.getSession()` here.
  // `getUser()` sends a request to the Supabase Auth server every time,
  // guaranteeing the data is fresh and safe from token tampering.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Route protection ────────────────────────────────────────────────
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    // Preserve the attempted URL so we can redirect back after login.
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

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
