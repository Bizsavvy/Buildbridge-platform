import { createClient } from "@/lib/supabase/server"
import { type NotificationType, NotificationChannel } from "@/types"

const TERMII_API_KEY = process.env.TERMII_API_KEY
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || "BuildBridge"
const TERMII_BASE_URL = "https://api.ng.termii.com/api"

interface SendMessageResult {
  success: boolean
  message_id?: string
  error?: string
}

/**
 * Centralized Notification Service
 * Handles SMS and WhatsApp delivery via Termii.
 */
export async function sendNotification({
  userId,
  type,
  channel,
  message,
  needId,
  pledgeId,
  data = {}
}: {
  userId: string
  type: NotificationType
  channel: NotificationChannel
  message: string
  needId?: string
  pledgeId?: string
  data?: any
}) {
  const supabase = await createClient()

  // 1. Fetch user's phone number
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('phone')
    .eq('id', userId)
    .single()

  if (userError || !user?.phone) {
    console.error(`Failed to find phone for user ${userId}:`, userError)
    return { success: false, error: "Recipient phone not found." }
  }

  // 2. Prepare Payload
  const payload = {
    api_key: TERMII_API_KEY,
    to: user.phone,
    from: TERMII_SENDER_ID,
    sms: message,
    type: "plain",
    channel: channel === 'whatsapp' ? "whatsapp" : "generic" 
  }

  let result: SendMessageResult = { success: false }

  try {
    // 3. Dispatch to Termii
    const response = await fetch(`${TERMII_BASE_URL}/sms/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    const responseData = await response.json()

    if (response.ok && responseData.message_id) {
       result = { success: true, message_id: responseData.message_id }
    } else {
       result = { success: false, error: responseData.message || "Termii API Error" }
    }
  } catch (err: any) {
    result = { success: false, error: err.message }
  }

  // 4. Log to Database for Audit
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      channel,
      message,
      message_data: data,
      need_id: needId,
      pledge_id: pledgeId,
      sent: result.success,
      sent_at: result.success ? new Date().toISOString() : null,
      failed: !result.success,
      failure_reason: result.error,
      provider_reference: result.message_id
    })

  return result
}

/**
 * Specialized helpers
 */
export const notifyPledgeReceived = async (userId: string, amount: number, needId: string, pledgeId: string) => {
  const formattedAmount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount / 100)

  const message = `[BuildBridge] 🎉 You just received a pledge of ${formattedAmount} for your request! Check your dashboard for details.`
  
  return sendNotification({
    userId,
    type: 'pledge_received',
    channel: NotificationChannel.SMS, // Default to SMS for critical alerts
    message,
    needId,
    pledgeId,
    data: { amount }
  })
}

export const notifyMilestone = async (userId: string, percentage: number, needId: string) => {
  const message = `[BuildBridge] 🚀 Awesome! Your request is now ${percentage}% funded. Keep sharing your link to reach the goal!`
  
  return sendNotification({
    userId,
    type: percentage === 50 ? 'milestone_50' : percentage === 80 ? 'milestone_80' : 'milestone_100',
    channel: NotificationChannel.SMS,
    message,
    needId
  })
}
