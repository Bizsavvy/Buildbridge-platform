/**
 * DEMO MODE: Mock Supabase Server Client
 *
 * This file normally creates a real Supabase server client.
 * In demo mode, it returns a mock object that satisfies the same API shape
 * so every page/action that calls `createClient()` works without errors.
 *
 * To re-enable real Supabase:
 *   1. Set DEMO_MODE to false
 *   2. Ensure your .env has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

// ─── DEMO MODE FLAG ────────────────────────────────────────────────────────────
// Flip this to `false` to reconnect real Supabase
export const DEMO_MODE = false;
// ────────────────────────────────────────────────────────────────────────────────

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Mock query builder that chains fluently and resolves to empty data.
 * Supports: .select(), .eq(), .or(), .order(), .limit(), .single(), .insert(), .update()
 */
function createMockQueryBuilder() {
  const builder: any = {
    select: () => builder,
    eq: () => builder,
    neq: () => builder,
    or: () => builder,
    in: () => builder,
    is: () => builder,
    ilike: () => builder,
    order: () => builder,
    limit: () => builder,
    range: () => builder,
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    upsert: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: any) => resolve({ data: [], error: null }),
  };
  return builder;
}

/**
 * Mock Supabase client for server-side usage in demo mode.
 */
function createMockServerClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithOtp: async () => ({ data: {}, error: null }),
      verifyOtp: async () => ({ data: {}, error: null }),
      signInWithPassword: async () => ({ data: {}, error: null }),
      signUp: async () => ({ data: {}, error: null }),
      signOut: async () => ({ error: null }),
    },
    from: (_table: string) => createMockQueryBuilder(),
    storage: {
      from: (_bucket: string) => ({
        upload: async () => ({ data: { path: "demo/mock.jpg" }, error: null }),
        getPublicUrl: (_path: string) => ({
          data: { publicUrl: "/images/hero/tailor.png" },
        }),
      }),
    },
  };
}

/**
 * Creates a Supabase client for use in Server Components,
 * Server Actions, and Route Handlers.
 *
 * In demo mode, returns a mock that never hits a real database.
 */
export async function createClient() {
  if (DEMO_MODE) {
    return createMockServerClient() as any;
  }

  // ── Real Supabase (re-enable later) ──────────────────────────────────────
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method is called from a Server Component where
            // cookies cannot be set. This can be safely ignored if you have
            // middleware refreshing user sessions.
          }
        },
      },
    }
  );
}
