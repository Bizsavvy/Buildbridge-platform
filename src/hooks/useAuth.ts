import { useState, useEffect } from "react"
import { useDemoAuth } from "@/contexts/DemoAuthContext"

/**
 * DEMO MODE: Auth hook that relies entirely on DemoAuthContext.
 * No Supabase calls are made.
 *
 * To re-enable Supabase:
 *   1. Set DEMO_MODE to false
 *   2. Uncomment the Supabase imports and logic
 */

const DEMO_MODE = false;

// import { createClient } from "@/lib/supabase/client"
// import { type User } from "@supabase/supabase-js"

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { 
    isAuthenticated: demoAuthenticated, 
    signOut: demoSignOut,
    demoUser 
  } = useDemoAuth()

  useEffect(() => {
    if (DEMO_MODE) {
      // In demo mode, just check the demo context
      setUser(demoAuthenticated ? { id: 'demo-user', email: demoUser?.email } : null)
      setIsLoading(false)
      return
    }

    // ── Real Supabase Auth (re-enable later) ──────────────────────────────
    /*
    const supabase = createClient()

    if (demoAuthenticated) {
      setUser(null)
      setIsLoading(false)
      return
    }

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }

    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
    */
  }, [demoAuthenticated, demoUser])

  const signInWithPhone = async (phone: string) => {
    // Demo: This won't be called directly, but return compatible shape
    return { success: true, formattedPhone: phone }
  }

  const verifyOTP = async (phone: string, token: string) => {
    // Demo: Not used directly
    return { success: true, requiresOnboarding: false }
  }

  const signInWithEmail = async (email: string, password: string) => {
    // Demo: Not used directly
    return { success: true, requiresOnboarding: false }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    // Demo: Not used directly
    return { success: true, requiresOnboarding: true }
  }

  const signOut = async () => {
    setIsLoading(true)
    demoSignOut()
    setUser(null)
    setIsLoading(false)
  }

  return { 
    signInWithPhone, 
    verifyOTP, 
    signInWithEmail, 
    signUpWithEmail, 
    signOut, 
    user, 
    isLoading,
    isAuthenticated: demoAuthenticated || user !== null 
  }
}
