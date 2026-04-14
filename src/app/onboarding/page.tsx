import { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OnboardingForm } from "@/components/onboarding/OnboardingForm"

export const metadata: Metadata = {
  title: "Onboarding | BuildBridge",
  description: "Complete your profile to start requesting funding for your niche craft.",
}

export default async function OnboardingPage() {
  const supabase = await createClient()

  // 1. Verify Authentication
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/login")
  }

  // 2. Check if user already has a profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (profile) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center">
      <OnboardingForm />
    </main>
  )
}
