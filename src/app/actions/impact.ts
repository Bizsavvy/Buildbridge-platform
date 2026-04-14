"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function submitToImpactWallAction(formData: FormData) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Authentication required." }
    }

    const needId = formData.get("need_id") as string
    const caption = formData.get("caption") as string
    const publicDisplayConsent = formData.get("public_display_consent") === "on"

    if (!needId || !caption) {
      return { success: false, error: "Need ID and Success Caption are required." }
    }

    // 1. Fetch the need and ensure it belongs to the user and is COMPLETED with proof
    const { data: need, error: needError } = await supabase
      .from('needs')
      .select('id, profile_id, proof_photo_url, proof_video_url, status')
      .eq('id', needId)
      .single()

    if (needError || !need) {
      return { success: false, error: "Funding request not found." }
    }

    if (need.status !== 'completed' || !need.proof_photo_url) {
      return { success: false, error: "Only completed needs with proof media can be added to the wall." }
    }

    // 2. Create the impact wall submission
    const { error: insertError } = await supabase
      .from('impact_wall_submissions')
      .insert({
        need_id: need.id,
        profile_id: need.profile_id,
        photo_url: need.proof_photo_url,
        video_url: need.proof_video_url,
        caption: caption,
        public_display_consent: publicDisplayConsent,
        opted_in_at: new Date().toISOString(),
        moderation_status: 'pending' // Defaults to pending for safety
      })

    if (insertError) {
      if (insertError.code === '23505') {
        return { success: false, error: "This story is already submitted to the Impact Wall." }
      }
      console.error(insertError)
      return { success: false, error: "Failed to submit to Impact Wall." }
    }

    revalidatePath('/impact')
    revalidatePath('/dashboard')
    
    return { success: true, message: "Story submitted for moderation! It will appear on the wall soon." }
    
  } catch (err: any) {
    console.error("Impact Action Error:", err)
    return { success: false, error: err.message || "An unexpected error occurred." }
  }
}
