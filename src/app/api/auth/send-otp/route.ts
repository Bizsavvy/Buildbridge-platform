import { NextRequest, NextResponse } from "next/server"

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!
const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID!

/**
 * Normalise a Nigerian phone number to E.164 format.
 * "0801..." → "+234801..."
 * "234801..." → "+234801..."
 * Already "+234..." → kept as-is
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
    const { phone } = await req.json()

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required." },
        { status: 400 }
      )
    }

    const e164Phone = toE164(phone)

    // Validate that the env vars are set
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
      console.error("Missing Twilio env vars")
      return NextResponse.json(
        { success: false, error: "Server configuration error. Please contact support." },
        { status: 500 }
      )
    }

    // Call Twilio Verify API — send SMS OTP
    const twilioUrl = `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/Verifications`

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
        Channel: "sms",
      }),
    })

    const data = await response.json()

    if (response.ok && data.status === "pending") {
      return NextResponse.json({ success: true })
    }

    // Handle specific Twilio errors gracefully
    if (response.status === 429) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      )
    }

    // Free trial: unverified number error
    if (data.code === 21608 || data.message?.includes("unverified")) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This number is not verified on our Twilio trial. Please add it as a Verified Caller ID in the Twilio Console, or use the number you registered with.",
        },
        { status: 400 }
      )
    }

    console.error("Twilio Verify send error:", data)
    return NextResponse.json(
      { success: false, error: data.message || "Failed to send OTP." },
      { status: response.status }
    )
  } catch (err: any) {
    console.error("Send OTP exception:", err)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    )
  }
}
