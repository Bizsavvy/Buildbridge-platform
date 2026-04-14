import { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VouchForm } from "@/components/vouching/VouchForm"

export const metadata: Metadata = {
  title: "Vouch for a Tradesperson | BuildBridge",
  description: "Vouch for a skilled worker on BuildBridge.",
}

export default async function VouchPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // 1. Verify Authentication
  // Anyone vouching must be a registered user to prevent anonymous spam
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // We pass a return URL to login so they can snap back to this exact page
    redirect(`/login?returnUrl=/profile/${params.id}/vouch`)
  }

  // 2. Fetch Recipient Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, user_id, trade_category, users!inner(name)")
    .eq("id", params.id)
    .single()

  if (!profile) {
    redirect("/") // Fallback if invalid ID
  }

  // Cast because inner join returns array typing natively, but single guarantees one user record
  const recipientName = (profile.users as any).name || "this tradesperson"

  // 3. Ensure voucher isn't vouching for themselves
  if (profile.user_id === user.id) {
     return (
        <main className="min-h-screen bg-background pt-32 pb-12 px-4 flex justify-center text-center">
            <h1 className="text-display-small text-on-surface">You cannot vouch for your own profile.</h1>
        </main>
     )
  }

  // 4. Ensure they haven't already vouched
  const { data: existingVouch } = await supabase
    .from("vouches")
    .select("id")
    .eq("recipient_profile_id", profile.id)
    .eq("voucher_user_id", user.id)
    .single()

  if (existingVouch) {
     return (
        <main className="min-h-screen bg-background pt-32 pb-12 px-4 flex flex-col justify-center items-center text-center gap-6">
            <h1 className="text-display-small text-on-surface">You have already vouched.</h1>
            <p className="text-body-large text-on-surface-variant max-w-md">Thank you for supporting {recipientName}. You can only submit one vouch per tradesperson.</p>
        </main>
     )
  }

  return (
    <main className="min-h-screen bg-background pt-24 pb-12">
      <VouchForm recipientProfileId={profile.id} recipientName={recipientName} />
    </main>
  )
}
