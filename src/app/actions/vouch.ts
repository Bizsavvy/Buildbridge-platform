"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function submitVouchAction(formData: FormData) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Authentication required to vouch." }
    }

    const recipientProfileId = formData.get("recipient_profile_id") as string
    const relationshipType = formData.get("relationship_type") as string
    const relationshipDurationYears = parseInt(formData.get("relationship_duration_years") as string || "0")
    const statement = formData.get("statement") as string

    if (!recipientProfileId || !relationshipType || !statement) {
      return { success: false, error: "Missing required fields." }
    }

    if (statement.length < 20 || statement.length > 300) {
      return { success: false, error: "Vouch statement must be between 20 and 300 characters." }
    }

    // 1. Check if trying to vouch for self
    const { data: voucherProfile } = await supabase
       .from('profiles')
       .select('id, user_id, can_vouch')
       .eq('user_id', user.id)
       .single()

    if (!voucherProfile) {
       return { success: false, error: "Voucher profile not found." }
    }

    if (voucherProfile.id === recipientProfileId) {
      return { success: false, error: "You cannot vouch for yourself." }
    }

    // 2. Insert vouch
    const { error: insertError } = await supabase
       .from('vouches')
       .insert({
          voucher_user_id: user.id,
          recipient_profile_id: recipientProfileId,
          relationship_type: relationshipType,
          relationship_duration_years: relationshipDurationYears,
          statement: statement
       })

    if (insertError) {
      if (insertError.code === '23505') { // Unique constraint violation
        return { success: false, error: "You have already vouched for this tradesperson." }
      }
      console.error(insertError)
      return { success: false, error: "Failed to submit vouch." }
    }

    // 3. Recalculate recipient profile badge level
    const { data: recipientProfile } = await supabase
        .from('profiles')
        .select('id, badge_level, vouch_count')
        .eq('id', recipientProfileId)
        .single()

    if (recipientProfile) {
       let newCount = (recipientProfile.vouch_count || 0) + 1;
       let newLevel = recipientProfile.badge_level;

       if (newLevel === 'level_0_unverified' && newCount >= 3) {
          newLevel = 'level_1_community_member';
       } else if (newLevel === 'level_1_community_member' && newCount >= 5) {
          newLevel = 'level_2_trusted_tradesperson';
       } else if (newLevel === 'level_2_trusted_tradesperson' && newCount >= 10) {
          newLevel = 'level_3_established';
       }

       await supabase
         .from('profiles')
         .update({ 
            vouch_count: newCount,
            badge_level: newLevel
         })
         .eq('id', recipientProfileId)
    }

    revalidatePath(`/profile/${recipientProfileId}`)
    return { success: true }
    
  } catch (err: any) {
    console.error("Vouch Action Error:", err)
    return { success: false, error: err.message || "An unexpected error occurred." }
  }
}
