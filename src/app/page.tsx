import { Metadata } from "next"
import { Hero } from "@/components/home/Hero"
import { FeaturedNeeds } from "@/components/home/FeaturedNeeds"
import { HowItWorks } from "@/components/home/HowItWorks"
import { PartnerLogos } from "@/components/home/PartnerLogos"
import { CoreValues } from "@/components/home/CoreValues"
import { ImpactHighlights } from "@/components/home/ImpactHighlights"
import { ImpactTeaser } from "@/components/home/ImpactTeaser"
import { FinalCTA } from "@/components/home/FinalCTA"

export const metadata: Metadata = {
  title: "BuildBridge | Empower Change with Every Support",
  description: "Direct investment in African skilled trades. Connect with verified tradespeople and fund their equipment needs with zero interest.",
}

// Mock stats for immediate visual fidelity
const MOCK_STATS = {
  totalFunded: 45200000, // 45.2M kobo = 452k Naira (example)
  totalTradespeople: 1284,
}

/**
 * DEMO MODE: Rich mock featured needs replace the Supabase query.
 * These showcase realistic Nigerian artisan profiles and needs.
 *
 * To re-enable Supabase:
 *   1. Import createClient from "@/lib/supabase/server"
 *   2. Restore the supabase.from("needs").select(...) query
 */
const MOCK_FEATURED_NEEDS = [
  {
    id: "demo-need-001",
    item_name: "Industrial Overlock Machine",
    item_cost: 35000000,
    funded_amount: 21500000,
    funding_percentage: 61,
    pledge_count: 14,
    status: "active",
    photo_url: "/images/hero/tailor.png",
    story: "I need an overlock machine to take on more uniform contracts for local schools.",
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    profile: {
      name: "Amina S.",
      location_lga: "Surulere",
      location_state: "Lagos",
      trade_category: "tailor",
      badge_level: "level_3_established",
      vouch_count: 8,
      photo_url: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200",
    },
  },
  {
    id: "demo-need-002",
    item_name: "Precision Wood Planer",
    item_cost: 52000000,
    funded_amount: 39000000,
    funding_percentage: 75,
    pledge_count: 22,
    status: "active",
    photo_url: "/images/hero/carpenter.png",
    story: "A wood planer will let me finish furniture sets in half the time with zero waste.",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    profile: {
      name: "Chidi O.",
      location_lga: "Enugu North",
      location_state: "Enugu",
      trade_category: "carpenter",
      badge_level: "level_4_platform_verified",
      vouch_count: 15,
      photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    },
  },
  {
    id: "demo-need-003",
    item_name: "Commercial Baking Oven",
    item_cost: 28000000,
    funded_amount: 8400000,
    funding_percentage: 30,
    pledge_count: 7,
    status: "active",
    photo_url: "/images/hero/baker.png",
    story: "I bake bread for 3 communities but my current oven is failing. A new one lets me hire 2 more hands.",
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    profile: {
      name: "Fatima B.",
      location_lga: "Kano Municipal",
      location_state: "Kano",
      trade_category: "baker",
      badge_level: "level_2_trusted_tradesperson",
      vouch_count: 5,
      photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    },
  },
]

export default async function Home() {
  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      <Hero stats={MOCK_STATS} />
      
      <PartnerLogos />

      <CoreValues />

      <ImpactHighlights />
      
      {/* Demo: Rich mock needs data */}
      <FeaturedNeeds needs={MOCK_FEATURED_NEEDS as any} />
      
      <HowItWorks />
      
      <ImpactTeaser />
      
      <FinalCTA />
    </div>
  )
}
