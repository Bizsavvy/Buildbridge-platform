"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { TrustTracker } from "@/components/dashboard/TrustTracker"
import { NINVerificationForm } from "@/components/dashboard/NINVerificationForm"
import { SubmitImpactModal } from "@/components/dashboard/SubmitImpactModal"
import { Button } from "@/components/ui/Button"
import { NeedCard, NeedCardSkeleton } from "@/components/ui/NeedCard"
import { EmptyState } from "@/components/ui/EmptyState"
import { BadgeDisplay } from "@/components/ui/BadgeDisplay"
import { 
  Plus, 
  Settings, 
  TrendingUp, 
  Users, 
  ShieldCheck,
  ChevronRight,
  Sparkles,
  CheckCircle2
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [profile, setProfile] = useState<any>(null)
  const [needs, setNeeds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSubmittingImpact, setIsSubmittingImpact] = useState(false)
  const [selectedNeedForImpact, setSelectedNeedForImpact] = useState<any>(null)
  const [showCopied, setShowCopied] = useState(false)

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(profile)

      const { data: needs } = await supabase
        .from('needs')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
      
      setNeeds(needs || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleVerificationSuccess = async () => {
    // Backend has securely updated the profile tier based on verification bounds.
    await fetchDashboardData()
    setIsVerifying(false)
  }

  const handleImpactSuccess = async () => {
    await fetchDashboardData()
    setIsSubmittingImpact(false)
  }

  const handleVouchRequest = () => {
    if (!profile?.id) return
    const vouchUrl = `${window.location.origin}/profile/${profile.id}/vouch`
    navigator.clipboard.writeText(vouchUrl)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 px-4 sm:px-6 lg:px-8">
         <div className="max-w-7xl mx-auto flex flex-col gap-12 animate-pulse">
            <div className="h-40 bg-surface-variant/30 rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="h-64 bg-surface-variant/30 rounded-3xl" />
               <div className="h-64 bg-surface-variant/30 rounded-3xl" />
            </div>
         </div>
      </div>
    )
  }

  const badgeEnumMapping: any = {
    'level_0_unverified': 0,
    'level_1_community_member': 1,
    'level_2_trusted_tradesperson': 2,
    'level_3_established': 3,
    'level_4_platform_verified': 4
  }

  return (
    <main className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="flex flex-col gap-2">
              <h1 className="text-display-small font-black text-on-surface">
                 Welcome back, <span className="text-primary">{profile?.name.split(' ')[0]}!</span>
              </h1>
              <p className="text-body-large text-on-surface-variant max-w-xl">
                 Manage your funding needs and build your trade reputation on BuildBridge.
              </p>
           </div>
           <div className="flex gap-4">
              <Button variant="ghost" className="rounded-2xl h-14 w-14 border border-outline-variant">
                 <Settings className="h-6 w-6" />
              </Button>
              <Link href="/dashboard/create-need">
                 <Button className="h-14 px-8 rounded-2xl gap-2 text-title-medium shadow-lg">
                    <Plus className="h-6 w-6" />
                    New Funding Need
                 </Button>
              </Link>
           </div>
        </div>

        <TrustTracker 
          currentLevel={badgeEnumMapping[profile?.badge_level || 'level_0_unverified']}
          vouches={profile?.vouch_count || 0}
          deliveries={profile?.delivered_count || 0}
          onVerifyClick={() => setIsVerifying(true)}
          onVouchRequest={handleVouchRequest}
        />

        <AnimatePresence>
          {showCopied && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-on-surface text-surface py-3 px-6 rounded-2xl shadow-2xl font-bold flex items-center gap-2"
            >
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Vouch link copied to clipboard!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Two-Column Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* Left: Your Active Needs */}
           <div className="lg:col-span-8 flex flex-col gap-8">
              <div className="flex items-center justify-between">
                 <h2 className="text-display-small font-black text-on-surface">Active Needs</h2>
                 <Link href="/dashboard/needs" className="text-label-large font-bold text-primary flex items-center gap-1 hover:underline">
                    View All <ChevronRight className="h-4 w-4" />
                 </Link>
              </div>

              {needs.length > 0 ? (
                 <div className="flex flex-col gap-6">
                    {/* Highlight Needs ready for Impact Wall */}
                    {needs.some(n => n.status === 'completed') && (
                        <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 text-center md:text-left">
                                <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-title-medium font-black text-on-surface">Share your success stories!</h4>
                                    <p className="text-body-small text-on-surface-variant">You have funded needs ready for the Impact Wall.</p>
                                </div>
                            </div>
                            <Button 
                                variant="primary" 
                                size="sm"
                                onClick={() => {
                                    const readyNeed = needs.find(n => n.status === 'completed');
                                    setSelectedNeedForImpact(readyNeed);
                                    setIsSubmittingImpact(true);
                                }}
                                className="rounded-xl px-6 min-w-[200px]"
                            >
                                Share Your {needs.find(n => n.status === 'completed')?.item_name} Story
                            </Button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {needs.map(need => (
                           <NeedCard key={need.id} need={{...need, profile}} />
                        ))}
                    </div>
                 </div>
              ) : (
                <EmptyState 
                   icon={Sparkles}
                   title="Your first goal starts here"
                   description="Create a need to get tools, equipment, or materials backed by the community."
                   actionLabel="Start a Request"
                   onAction={() => router.push('/dashboard/create-need')}
                />
              )}
           </div>

           {/* Right: Quick Stats & Trust Ladder */}
           <div className="lg:col-span-4 flex flex-col gap-10">
              
              {/* Quick Metrics */}
              <div className="p-8 bg-surface border border-outline-variant shadow-sm rounded-[2rem] flex flex-col gap-6">
                 <h3 className="text-title-medium font-black text-on-surface uppercase tracking-widest text-label-small">
                    Your Impact
                 </h3>
                 <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-4 bg-surface-variant/30 rounded-2xl">
                       <div className="flex items-center gap-3">
                          <TrendingUp className="h-5 w-5 text-badge-2" />
                          <span className="text-body-medium font-bold">Funds Raised</span>
                       </div>
                       <span className="text-title-medium font-black">₦0</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-surface-variant/30 rounded-2xl">
                       <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-badge-3" />
                          <span className="text-body-medium font-bold">Total Backers</span>
                       </div>
                       <span className="text-title-medium font-black">0</span>
                    </div>
                 </div>
              </div>

              {/* Small Ladder Teaser */}
              <div className="p-8 bg-on-surface text-surface rounded-[2rem] flex flex-col gap-6 shadow-xl">
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <h3 className="text-title-medium font-black">Trust Engine</h3>
                 </div>
                 <p className="text-body-small opacity-80 leading-relaxed font-medium">
                    "Platform Verified" tradespeople are funded **4x faster** than unverified members.
                 </p>
                 <Button 
                   onClick={() => setIsVerifying(true)} 
                   className="w-full h-14 rounded-2xl gap-2 font-black text-on-surface bg-surface hover:bg-surface-variant/80 border-none"
                 >
                    Get Level 4 Badge
                 </Button>
              </div>

           </div>
        </div>

        {/* Global Reference Area */}
        <div className="mt-10 pt-10 border-t border-outline-variant">
           <BadgeDisplay />
        </div>

      </div>

      {/* NIN Verification Overlay */}
      <AnimatePresence>
        {isVerifying && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-on-surface/80 backdrop-blur-md"
               onClick={() => setIsVerifying(false)}
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-lg bg-surface rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
            >
               <NINVerificationForm 
                  onSuccess={handleVerificationSuccess} 
                  onClose={() => setIsVerifying(false)} 
               />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Impact Submission Overlay */}
      <AnimatePresence>
        {isSubmittingImpact && selectedNeedForImpact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-on-surface/80 backdrop-blur-md"
               onClick={() => setIsSubmittingImpact(false)}
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-lg bg-surface rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
            >
               <SubmitImpactModal 
                  needId={selectedNeedForImpact.id}
                  itemName={selectedNeedForImpact.item_name}
                  onSuccess={handleImpactSuccess} 
                  onClose={() => setIsSubmittingImpact(false)} 
               />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  )
}
