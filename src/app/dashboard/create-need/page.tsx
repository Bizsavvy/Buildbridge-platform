import { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CreateNeedForm } from "@/components/dashboard/CreateNeedForm"

export const metadata: Metadata = {
  title: "Request Funding | BuildBridge",
  description: "Request tools and equipment to grow your business.",
}

export default async function CreateNeedPage() {
  const supabase = await createClient()

  // 1. Verify Authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // 2. Fetch profile to get trade_category
  const { data: profile } = await supabase
    .from("profiles")
    .select("trade_category, id")
    .eq("user_id", user.id)
    .single()

  if (!profile || !profile.trade_category) {
    // Redirect to onboarding if they skipped it or it's incomplete
    redirect("/onboarding")
  }

  return (
    <main className="min-h-screen bg-background pt-24 pb-12">
      <CreateNeedForm tradeCategory={profile.trade_category} />
    </main>
  )
}
