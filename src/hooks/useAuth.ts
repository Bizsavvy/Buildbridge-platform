import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { type User } from "@supabase/supabase-js"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
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
  }, [supabase])

  const signInWithPhone = async (phone: string) => {
    setIsLoading(true)
    try {
      let formattedPhone = phone.trim()
      if (formattedPhone.startsWith("0") && formattedPhone.length === 11) {
        formattedPhone = "+234" + formattedPhone.slice(1)
      } else if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+234" + formattedPhone
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      })

      if (error) {
        console.error("Auth Sign In Error:", error)
        if (error.message?.includes("sms provider") || error.status === 400 || error.message?.includes("Signups not allowed")) {
          throw new Error("We couldn't text that number. Please check for typos and try again.")
        }
        throw new Error(error.message)
      }
      return { success: true, formattedPhone }
    } catch (err: any) {
      return { error: err.message || "We encountered a network issue. Please try again." }
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOTP = async (phone: string, token: string) => {
    setIsLoading(true)
    try {
      let formattedPhone = phone.trim()
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "+234" + formattedPhone.slice(1)
      } else if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+234" + formattedPhone
      }

      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: token,
        type: "sms",
      })

      if (error) {
         console.error("Auth Verify Error:", error)
         throw new Error("The code entered is incorrect or expired. Please request a new one.")
      }

      let requiresOnboarding = true;
      if (data?.user) {
        // Check if user has an existing complete profile
        const { data: profile, error: dbError } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", data.user.id)
          .single()

        if (profile) requiresOnboarding = false
      }

      return { success: true, requiresOnboarding }
    } catch (err: any) {
      return { error: err.message || "We encountered a network issue. Please try again." }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setIsLoading(false)
  }

  return { signInWithPhone, verifyOTP, signOut, user, isLoading }
}
