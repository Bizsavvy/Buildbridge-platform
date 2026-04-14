import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "")
      .update(body)
      .digest("hex")

    // 1. Signature Verification
    if (hash !== req.headers.get("x-paystack-signature")) {
      console.error("Invalid Paystack signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)

    // Only process successful charges
    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true }, { status: 200 })
    }

    const { data } = event
    const { reference, amount, metadata } = data
    const { need_id, backer_user_id } = metadata

    if (!need_id || !backer_user_id) {
       console.error("Missing metadata in Paystack event", metadata)
       return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
    }

    const supabase = await createClient()

    // 2. Financial Arithmetic (Kobo)
    const totalPledgeKobo = amount // Already in kobo from Paystack
    const platformFeeKobo = Math.floor(totalPledgeKobo * 0.05) // 5% BuildBridge fee
    const processingFeeKobo = Math.floor(totalPledgeKobo * 0.015) + (totalPledgeKobo > 250000 ? 10000 : 0) // Paystack 1.5% + N100 if > N2500
    const tradespersonReceivesKobo = totalPledgeKobo - platformFeeKobo - processingFeeKobo

    const feeBreakdown = {
      platform_fee: platformFeeKobo,
      processing_fee: processingFeeKobo,
      tradesperson_receives: tradespersonReceivesKobo
    }

    // 3. Escrow Orchestration (Database Transaction)
    // We use Supabase RPC or a simple sequential update since Next.js server actions / routes are single-execution
    // For production, use a database function (RPC) for atomicity
    
    // Step A: Create Pledge Record
    const { error: pledgeError } = await supabase
      .from("pledges")
      .insert({
        need_id,
        backer_user_id,
        amount: totalPledgeKobo,
        currency: "NGN",
        fee_breakdown_json: feeBreakdown,
        payment_provider: "paystack",
        payment_reference: reference,
        payment_status: "completed",
        paid_at: new Date().toISOString()
      })

    if (pledgeError) {
      if (pledgeError.code === "23505") { // Unique constraint (idempotency)
        return NextResponse.json({ received: true, note: "Pledge already processed" }, { status: 200 })
      }
      throw pledgeError
    }

    // Step B: Update Need Total
    const { data: need, error: fetchError } = await supabase
      .from("needs")
      .select("item_cost, funded_amount, pledge_count")
      .eq("id", need_id)
      .single()

    if (fetchError || !need) throw fetchError || new Error("Need not found")

    const newFundedAmount = (need.funded_amount || 0) + totalPledgeKobo
    const isFullyFunded = newFundedAmount >= need.item_cost

    const updateData: any = {
       funded_amount: newFundedAmount,
       pledge_count: (need.pledge_count || 0) + 1,
       updated_at: new Date().toISOString()
    }

    if (isFullyFunded) {
       updateData.status = "funded"
       updateData.completed_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from("needs")
      .update(updateData)
      .eq("id", need_id)

    if (updateError) throw updateError

    // 4. Notifications & Milestones
    try {
      // We need the profile owner's user_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('id', need_id === metadata.need_id ? need_id : metadata.need_id) // Safety check on IDs
        .single()

      if (profile?.user_id) {
        // Trigger Pledge Notification
        const { notifyPledgeReceived } = await import("@/lib/notifications")
        const { checkAndTriggerMilestones } = await import("@/lib/milestones")

        await notifyPledgeReceived(profile.user_id, totalPledgeKobo, need_id, reference)
        await checkAndTriggerMilestones(need_id)
      }
    } catch (notifErr) {
      // We don't want to fail the webhook if notifications fail, we log them for audit anyway
      console.error("Non-critical notification error:", notifErr)
    }

    return NextResponse.json({ received: true }, { status: 200 })

  } catch (error: any) {
    console.error("Paystack webhook error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
