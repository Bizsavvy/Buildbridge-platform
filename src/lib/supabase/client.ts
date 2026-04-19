/**
 * DEMO MODE: Mock Supabase Browser Client
 *
 * This file normally creates a real Supabase browser client.
 * In demo mode, it returns a mock object that satisfies the same API shape
 * so every client component that calls `createClient()` works without errors.
 *
 * To re-enable real Supabase:
 *   1. Set DEMO_MODE to false
 *   2. Ensure your .env has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

// ─── DEMO MODE FLAG ────────────────────────────────────────────────────────────
// Flip this to `false` to reconnect real Supabase
const DEMO_MODE = false;
// ────────────────────────────────────────────────────────────────────────────────

import { createBrowserClient } from "@supabase/ssr";

/**
 * Mock query builder that chains fluently and resolves to empty data.
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
 * Mock Supabase client for browser/client component usage in demo mode.
 */
function createMockBrowserClient() {
  const noopUnsubscribe = { subscription: { unsubscribe: () => {} } };

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithOtp: async () => ({ data: {}, error: null }),
      verifyOtp: async () => ({ data: {}, error: null }),
      signInWithPassword: async () => ({ data: {}, error: null }),
      signUp: async () => ({ data: {}, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: (_callback: any) => ({ data: noopUnsubscribe }),
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
 * Creates a Supabase client for use in Browser / Client Components.
 *
 * In demo mode, returns a mock that never hits a real database.
 */
export function createClient() {
  if (DEMO_MODE) {
    return createMockBrowserClient() as any;
  }

  // ── Real Supabase (re-enable later) ──────────────────────────────────────
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
