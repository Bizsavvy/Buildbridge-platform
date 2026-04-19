"use server"

/**
 * DEMO MODE: Returns success immediately without any Supabase calls.
 *
 * To re-enable Supabase:
 *   1. Set DEMO_MODE to false
 *   2. Import createClient from "@/lib/supabase/server"
 *   3. Restore the full auth check, upload, and database insert logic
 */

const DEMO_MODE = false;

// Keep real imports for when demo is disabled
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createNeedAction(formData: FormData) {
  if (DEMO_MODE) {
    // Simulate network delay for visual fidelity
    await new Promise(resolve => setTimeout(resolve, 1500));
    revalidatePath("/dashboard");
    return { success: true };
  }

  // ── Real Supabase Logic (re-enable later) ────────────────────────────────
  const supabase = await createClient()

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Authentication required")

  // 2. Fetch profile_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!profile) throw new Error("Tradesperson profile not found")

  // 3. Extract and Validate
  const itemName = formData.get("item_name") as string
  const customItem = formData.get("custom_item") as string
  const finalItemName = itemName === "custom" ? customItem : itemName
  
  const rawCost = formData.get("item_cost") as string
  const itemCostKobo = parseInt(rawCost.replace(/[^0-9]/g, "")) * 100
  
  const story = formData.get("story") as string
  const impact = formData.get("impact_statement") as string
  const deadlineDays = parseInt(formData.get("deadline_days") as string)
  const lat = formData.get("geotag_lat") ? parseFloat(formData.get("geotag_lat") as string) : null
  const lng = formData.get("geotag_lng") ? parseFloat(formData.get("geotag_lng") as string) : null
  const photoFile = formData.get("photo_file") as File

  if (!finalItemName || itemCostKobo <= 0 || !story || !photoFile) {
    throw new Error("Missing required fields")
  }

  if (itemCostKobo > 100000000) { // Max 1M Naira = 100M Kobo
    throw new Error("Maximum request limit is NGN 1,000,000")
  }

  // 4. Upload photo to 'needs' bucket
  const fileExt = photoFile.name.split('.').pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`
  const filePath = `needs/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from("needs")
    .upload(filePath, photoFile)

  if (uploadError) throw new Error("Failed to upload photo")

  const { data: { publicUrl } } = supabase.storage
    .from("needs")
    .getPublicUrl(filePath)

  // 5. Calculate deadline date
  const deadlineDate = new Date()
  deadlineDate.setDate(deadlineDate.getDate() + deadlineDays)

  // 6. Insert into Database
  const { error: dbError } = await supabase
    .from("needs")
    .insert({
      profile_id: profile.id,
      item_name: finalItemName,
      item_cost: itemCostKobo,
      photo_url: publicUrl,
      photo_geotag_lat: lat,
      photo_geotag_lng: lng,
      story: story.slice(0, 150), // Enforce DB char limit
      impact_statement: impact.slice(0, 200), // Enforce DB char limit
      deadline: deadlineDate.toISOString().split('T')[0], // DATE format
      status: "pending_review",
      impact_statement_source: "manual",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

  if (dbError) {
    console.error("DB Error:", dbError)
    throw new Error(dbError.message)
  }

  revalidatePath("/dashboard")
  return { success: true }
}
