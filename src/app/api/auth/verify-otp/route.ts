import { NextRequest, NextResponse } from "next/server"

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!
const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID!

/**
 * Normalise a Nigerian phone number to E.164 format.
 */
function toE164(phone: string): string {
  let cleaned = phone.replace(/[\s\-()]/g, "")
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    return "+234" + cleaned.slice(1)
  }
  if (cleaned.startsWith("234") && !cleaned.startsWith("+")) {
    return "+" + cleaned
  }
  if (!cleaned.startsWith("+")) {
    return "+234" + cleaned
  }
  return cleaned
}

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json()

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: "Phone number and OTP code are required." },
        { status: 400 }
      )
    }

    const e164Phone = toE164(phone)

    // Validate env vars
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
      console.error("Missing Twilio env vars")
      return NextResponse.json(
        { success: false, error: "Server configuration error. Please contact support." },
        { status: 500 }
      )
    }

    // Call Twilio Verify API — check OTP
    const twilioUrl = `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`

    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64"),
      },
      body: new URLSearchParams({
        To: e164Phone,
        Code: code,
      }),
    })

    const data = await response.json()

    if (response.ok && data.status === "approved") {
      return NextResponse.json({ success: true, status: "approved" })
    }

    if (response.ok && data.status === "pending") {
      return NextResponse.json(
        { success: false, status: "pending", error: "Invalid code. Please try again." },
        { status: 400 }
      )
    }

    // Handle rate limiting
    if (response.status === 429) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please wait and try again." },
        { status: 429 }
      )
    }

    // Handle expired / not found verification
    if (data.code === 20404 || data.message?.includes("not found")) {
      return NextResponse.json(
        { success: false, error: "Verification expired or not found. Please request a new code." },
        { status: 400 }
      )
    }

    console.error("Twilio Verify check error:", data)
    return NextResponse.json(
      { success: false, error: data.message || "Verification failed." },
      { status: response.status }
    )
  } catch (err: any) {
    console.error("Verify OTP exception:", err)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    )
  }
}
