import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { type, documentId } = await req.json()

    if (!type || !['nin', 'bvn'].includes(type) || !documentId) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 })
    }

    // Strict 11-digit regex validation for NIN/BVN
    if (!/^\d{11}$/.test(documentId)) {
      return NextResponse.json({ error: "Invalid format. Must be exactly 11 digits." }, { status: 400 })
    }

    // Fetch user profile ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, badge_level')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Generate SHA-256 Hash of the critical PII
    // NOTE: In production, salt should be added via a secret ENV variable
    const salt = process.env.IDENTITY_SALT || "fallback_salt_39812";
    const generatedHash = crypto.createHash('sha256').update(documentId + salt).digest('hex')

    // Since we don't have active Prembly/Dojah keys, we simulate the validation success for MVP
    // NOTE: Replace this block with a fetch() call to Dojah in production
    const provider = "dojah"
    const isMocksVerified = true // Simulate clear background check

    if (!isMocksVerified) {
       return NextResponse.json({ error: "Identity verification failed at the provider level." }, { status: 422 })
    }

    // Insert verification tracking record
    // We update on conflict to allow them to correct if needed, but uniqueness on hash applies.
    const { error: insertError } = await supabase
       .from('verifications')
       .upsert({
          profile_id: profile.id,
          [type === 'nin' ? 'nin_hash' : 'bvn_hash']: generatedHash,
          [type === 'nin' ? 'nin_verified_at' : 'bvn_verified_at']: new Date().toISOString(),
          provider: provider,
          verified: true
       }, {
          onConflict: 'profile_id'
       })

    if (insertError) {
      // Check for unique key violation (meaning this NIN is already used)
      if (insertError.code === '23505') {
         return NextResponse.json({ error: "This identity document is already registered to another user." }, { status: 409 })
      }
      console.error(insertError)
      return NextResponse.json({ error: "Failed to store verification securely." }, { status: 500 })
    }

    // Automatically boost their Badge Level to 0 if they were unverified
    let newLevel = profile.badge_level;
    if (!newLevel || newLevel === 'level_0_unverified') {
        newLevel = 'level_0_unverified'; // Ensure type match
        await supabase
           .from('profiles')
           .update({ badge_level: newLevel })
           .eq('id', profile.id)
    }

    return NextResponse.json({ success: true, message: "Identity anchored securely." })

  } catch (err: any) {
    console.error("Identity Verification Error", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
