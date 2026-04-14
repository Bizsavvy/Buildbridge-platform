import * as React from "react"
import { createClient } from "@/lib/supabase/server"
import { ImpactGrid } from "@/components/impact/ImpactGrid"
import { BadgeDisplay } from "@/components/ui/BadgeDisplay"
import { Sparkles } from "lucide-react"

export const metadata = {
  title: "The Impact Wall | BuildBridge Success Stories",
  description: "Witness the power of community-backed growth. See real stories of Nigerian tradespeople reaching their potential.",
}

export default async function ImpactPage() {
  const supabase = await createClient()

  // Fetch only approved impact stories with tradesperson profile data
  const { data: submissions, error } = await supabase
    .from('impact_wall_submissions')
    .select('*, profile:profiles(*)')
    .eq('moderation_status', 'approved')
    .order('published_at', { ascending: false })

  if (error) {
    console.error("Impact Fetch Error:", error)
  }

  return (
    <main className="min-h-screen bg-background pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-6">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-label-large font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="h-4 w-4" />
              Direct Community Result
           </div>
           <h1 className="text-display-small sm:text-display-medium lg:text-display-large font-black text-on-surface max-w-4xl tracking-tight leading-[1.1]">
              The <span className="text-primary italic">Impact</span> Wall.
           </h1>
           <p className="text-body-large text-on-surface-variant max-w-2xl leading-relaxed">
              BuildBridge is more than just funding—it's transformation. Witness the real results of backer-powered growth in local Nigerian trade across the nation.
           </p>
        </div>

        {/* The Grid Component */}
        <ImpactGrid submissions={(submissions as any) || []} />

        {/* Global Reference Area */}
        <div className="mt-20 pt-20 border-t border-outline-variant flex flex-col gap-12">
            <div className="text-center flex flex-col gap-2">
                <h2 className="text-headline-large font-black text-on-surface">Verified Excellence</h2>
                <p className="text-body-medium text-on-surface-variant">Every person on this wall has been verified across multiple trust tiers.</p>
            </div>
            <BadgeDisplay />
        </div>

      </div>
    </main>
  )
}
