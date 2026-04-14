import { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NeedCard } from "@/components/ui/NeedCard"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { 
  MapPin, 
  Calendar, 
  Heart, 
  ShieldCheck, 
  Info,
  ChevronLeft,
  Share2
} from "lucide-react"
import Link from "next/link"
import { PledgeFlow } from "@/components/pledge/PledgeFlow"

interface NeedPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: NeedPageProps): Promise<Metadata> {
  const supabase = await createClient()
  const { data: need } = await supabase
    .from("needs")
    .select("item_name, story")
    .eq("id", params.id)
    .single()

  return {
    title: need ? `${need.item_name} | BuildBridge` : "Need Detail",
    description: need?.story || "Support a local tradesperson.",
  }
}

export default async function NeedDetailPage({ params }: NeedPageProps) {
  const supabase = await createClient()

  // 1. Fetch Need with Profile
  const { data: need, error } = await supabase
    .from("needs")
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq("id", params.id)
    .single()

  if (error || !need) {
    notFound()
  }

  const formattedGoal = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(need.item_cost / 100)

  const formattedRaised = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(need.funded_amount / 100)

  const percentage = (need.funded_amount / need.item_cost) * 100
  
  // Calculate days remaining
  const deadlineDate = new Date(need.deadline)
  const today = new Date()
  const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const daysLeft = Math.max(0, diffDays)

  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between mb-8">
           <Link href="/browse" className="flex items-center gap-2 text-label-large font-bold text-on-surface-variant hover:text-primary transition-colors">
              <ChevronLeft className="h-5 w-5" />
              Back to Browse
           </Link>
           <Button variant="ghost" size="sm" className="rounded-full">
              <Share2 className="h-5 w-5 mr-2" />
              Share
           </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           
           {/* Left Column: Media & Story */}
           <div className="lg:col-span-7 flex flex-col gap-8">
              <div className="aspect-[16/10] w-full rounded-3xl overflow-hidden bg-surface-variant border border-outline-variant shadow-lg">
                 <img 
                    src={need.photo_url} 
                    alt={need.item_name} 
                    className="w-full h-full object-cover"
                 />
              </div>

              <div className="flex flex-col gap-6">
                 <h1 className="text-display-small font-black text-on-surface leading-tight">
                    Help {need.profile.name} get a <span className="text-primary">{need.item_name}</span>
                 </h1>

                 {/* Impact Highlight */}
                 <div className="p-6 bg-badge-2/5 border border-badge-2/20 rounded-2xl flex gap-4">
                    <ShieldCheck className="h-8 w-8 text-badge-2 flex-shrink-0" />
                    <div>
                       <p className="text-label-medium uppercase font-bold text-badge-2 tracking-widest mb-1">Impact Goal</p>
                       <p className="text-body-large font-black text-on-surface">
                          "{need.impact_statement || "Using this tool to grow my business and hire more hands."}"
                       </p>
                    </div>
                 </div>

                 <div className="flex flex-col gap-4">
                    <h2 className="text-headline-small font-black text-on-surface">The Story</h2>
                    <p className="text-body-large text-on-surface-variant leading-relaxed whitespace-pre-line">
                       {need.story}
                    </p>
                 </div>
              </div>
           </div>

           {/* Right Column: Pledge & Profile Sidebar */}
           <div className="lg:col-span-5 flex flex-col gap-8">
              
              {/* Pledge Card */}
              <div className="p-8 rounded-3xl bg-surface border-2 border-primary/20 shadow-xl flex flex-col gap-6 sticky top-28">
                 <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                       <span className="text-display-small font-black text-on-surface">{formattedRaised}</span>
                       <span className="text-body-medium text-on-surface-variant font-bold mb-1">of {formattedGoal} goal</span>
                    </div>
                    <ProgressBar percentage={percentage} className="h-4" />
                    <div className="flex justify-between text-label-large font-bold text-on-surface-variant mt-1">
                       <span>{Math.floor(percentage)}% funded</span>
                       <span className="flex items-center gap-1 text-primary">
                          <Calendar className="h-4 w-4" />
                          {daysLeft} days left
                       </span>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 py-4 border-y border-outline-variant/30">
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-surface-variant/30">
                       <span className="text-headline-small font-black text-on-surface">{need.pledge_count}</span>
                       <span className="text-label-small uppercase font-bold text-on-surface-variant">Pledges</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-surface-variant/30">
                       <span className="text-headline-small font-black text-on-surface">{need.profile.vouch_count}</span>
                       <span className="text-label-small uppercase font-bold text-on-surface-variant">Vouches</span>
                    </div>
                 </div>

                 {/* Pledge Flow Trigger */}
                 <PledgeFlow 
                    needId={need.id} 
                    needName={need.item_name}
                    tradespersonName={need.profile.name}
                    goalAmount={need.item_cost}
                 />

                 <div className="p-4 bg-surface-variant/50 rounded-2xl flex gap-3">
                    <Info className="h-5 w-5 text-on-surface-variant flex-shrink-0" />
                    <p className="text-label-small text-on-surface-variant font-medium">
                       BuildBridge Escrow: Pledges are only released once the tradesperson uploads proof of purchase.
                    </p>
                 </div>
              </div>

              {/* Tradesperson Profile Quick View */}
              <div className="p-6 rounded-3xl bg-surface-variant/30 border border-outline-variant flex flex-col gap-4">
                 <p className="text-label-small uppercase font-bold text-on-surface-variant tracking-widest">About the Tradesperson</p>
                 <div className="flex items-center gap-4">
                    <img 
                       src={need.profile.photo_url} 
                       alt={need.profile.name} 
                       className="h-14 w-14 rounded-full border-2 border-surface shadow-sm object-cover"
                    />
                    <div className="flex flex-col">
                       <h3 className="text-title-medium font-black text-on-surface">{need.profile.name}</h3>
                       <div className="flex items-center gap-1 text-body-small text-on-surface-variant">
                          <MapPin className="h-3 w-3" />
                          {need.profile.location_lga}, {need.profile.location_state.toUpperCase()}
                       </div>
                    </div>
                 </div>
                 <Badge level={need.profile.badge_level === 'level_4_platform_verified' ? 4 : need.profile.badge_level === 'level_3_established' ? 3 : need.profile.badge_level === 'level_2_trusted_tradesperson' ? 2 : need.profile.badge_level === 'level_1_community_member' ? 1 : 0} />
              </div>

           </div>
        </div>
      </div>
    </main>
  )
}
