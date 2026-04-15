import { NextRequest, NextResponse } from "next/server"

const TERMII_API_KEY = process.env.TERMII_API_KEY
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || "BuildBridge"
const TERMII_BASE_URL = "https://v3.api.termii.com/api"

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    const expectedSecret = process.env.SMS_RELAY_SECRET
    
    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      console.error("Unauthorized SMS relay attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    
    // Supabase custom SMS provider payload usually looks like:
    // { "phone": "+23480...", "message": "Your confirmation code is..." }
    let rawPhone = body.phone || body.user?.phone || body.payload?.phone
    let message = body.message || body.sms || body.payload?.message
    
    if (!rawPhone || !message) {
      console.error("Invalid SMS payload received:", body)
      return NextResponse.json({ error: "Missing phone or message" }, { status: 400 })
    }

    // Termii works best with phone numbers starting with the country code but NO plus sign
    const cleanPhone = rawPhone.replace(/\+/g, "")

    const payload = {
      api_key: TERMII_API_KEY,
      to: cleanPhone,
      from: TERMII_SENDER_ID,
      sms: message,
      type: "plain",
      channel: "generic"
    }

    console.log("Dispatching to Termii:", { ...payload, api_key: "[REDACTED]" })

    const response = await fetch(`${TERMII_BASE_URL}/sms/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (response.ok && data.message_id) {
       return NextResponse.json({ success: true, message_id: data.message_id })
    } else {
       console.error("Termii Relay Failed:", data)
       return NextResponse.json({ success: false, error: data }, { status: 400 })
    }

  } catch (err: any) {
    console.error("SMS Relay Exception:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
