import { createClient } from "@/lib/supabase/server"
import { notifyMilestone } from "./notifications"

/**
 * Checks a need's funding progress and triggers 50%, 80%, or 100% alerts
 * if they haven't been triggered yet.
 */
export async function checkAndTriggerMilestones(needId: string) {
  const supabase = await createClient()

  // 1. Fetch current need progress and owner
  const { data: need, error: needError } = await supabase
    .from('needs')
    .select('id, profile_id, item_cost, funded_amount, profile:profiles(user_id)')
    .eq('id', needId)
    .single()

  if (needError || !need) {
    console.error("Milestone Check: Need not found", needId)
    return
  }

  const userId = (need.profile as any)?.user_id
  if (!userId) return

  const percentage = Math.floor((need.funded_amount / need.item_cost) * 100)
  
  // Define tiers to check
  const tiers = [50, 80, 100]
  const reachedTiers = tiers.filter(t => percentage >= t)

  if (reachedTiers.length === 0) return

  // 2. Check which milestones have already been triggered for this need
  const { data: existingMilestones } = await supabase
    .from('milestones')
    .select('milestone_pct')
    .eq('need_id', needId)

  const triggeredTiers = new Set(existingMilestones?.map(m => m.milestone_pct) || [])

  // 3. Trigger new milestones
  for (const tier of reachedTiers) {
    if (!triggeredTiers.has(tier)) {
      try {
        // Record milestone in DB first (idempotency)
        const { error: insertError } = await supabase
          .from('milestones')
          .insert({
            need_id: needId,
            milestone_pct: tier,
            triggered_at: new Date().toISOString()
          })

        if (!insertError) {
          // Send the actual notification
          await notifyMilestone(userId, tier, needId)
          
          // Update milestone record to show completion
          await supabase
            .from('milestones')
            .update({ backers_notified: true, backers_notified_at: new Date().toISOString() })
            .eq('need_id', needId)
            .eq('milestone_pct', tier)
        }
      } catch (err) {
        console.error(`Failed to trigger ${tier}% milestone for ${needId}:`, err)
      }
    }
  }
}
