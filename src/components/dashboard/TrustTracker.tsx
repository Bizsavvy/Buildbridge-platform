import * as React from "react"
import { Badge, type BadgeLevelType } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { Button } from "@/components/ui/Button"
import { ArrowRight, CheckCircle2, ShieldCheck, Star, User, Lock, ExternalLink } from "lucide-react"

interface TrustTrackerProps {
  currentLevel: BadgeLevelType;
  vouches: number;
  deliveries: number;
  onVerifyClick: () => void;
  onVouchRequest: () => void;
}

export function TrustTracker({ currentLevel, vouches, deliveries, onVerifyClick, onVouchRequest }: TrustTrackerProps) {
  
  const getNextMilestone = () => {
    switch (currentLevel) {
      case 0:
        return { 
          title: "Level 1: Community Member", 
          task: "Complete your profile details", 
          progress: 100, // Onboarding usually means they are at least Level 1
          cta: "Edit Profile" 
        }
      case 1:
        return { 
          title: "Level 2: Trusted Tradesperson", 
          task: `${2 - vouches} more community vouches needed`, 
          progress: (vouches / 2) * 100, 
          cta: "Request Vouches" 
        }
      case 2:
        return { 
          title: "Level 3: Established", 
          task: "Fully fund and deliver 1 need", 
          progress: (deliveries / 1) * 100, 
          cta: "Track Delivery" 
        }
      case 3:
        return { 
          title: "Level 4: Platform Verified", 
          task: "Verify your Government ID (NIN)", 
          progress: 0, 
          cta: "Verify NIN",
          isAction: true
        }
      case 4:
        return { 
          title: "Top Tier: Platform Verified", 
          task: "You've reached the highest trust level!", 
          progress: 100, 
          cta: "Share Badge" 
        }
      default:
        return null
    }
  }

  const next = getNextMilestone()

  return (
    <Card className="p-8 bg-surface-variant/20 border-outline-variant/30 shadow-none rounded-[2rem] overflow-hidden">
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
        
        {/* Current Status */}
        <div className="flex flex-col gap-4 min-w-[200px]">
           <p className="text-label-small uppercase font-black text-on-surface-variant tracking-widest">Your Trust Tier</p>
           <div className="relative inline-flex">
              <Badge level={currentLevel} className="scale-125 origin-left py-2 px-4" />
           </div>
           <p className="text-body-small text-on-surface-variant italic mt-2">
             “Trust is the currency of BuildBridge.”
           </p>
        </div>

        {/* Divider */}
        <div className="hidden md:block h-24 w-px bg-outline-variant/30" />

        {/* Next Step Progress */}
        <div className="flex-grow flex flex-col gap-6">
           <div className="flex justify-between items-end">
              <div className="flex flex-col gap-1">
                 <p className="text-label-small uppercase font-black text-primary tracking-widest">Next Milestone</p>
                 <h3 className="text-title-medium font-black text-on-surface">{next?.title}</h3>
              </div>
              <span className="text-label-large font-black text-primary">{Math.min(100, Math.round(next?.progress || 0))}%</span>
           </div>
           
           <div className="flex flex-col gap-3">
              <ProgressBar percentage={next?.progress || 0} className="h-3 bg-white" />
              <div className="flex items-center gap-2 text-body-medium text-on-surface-variant font-medium">
                 <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                 {next?.task}
              </div>
           </div>
           
           <div className="flex gap-4">
              {next?.isAction ? (
                <Button onClick={onVerifyClick} className="rounded-xl px-6 gap-2">
                   <Lock className="h-4 w-4" />
                   {next.cta}
                </Button>
              ) : (
                 <Button variant="ghost" onClick={onVouchRequest} className="rounded-xl px-4 gap-2 border border-outline-variant hover:bg-surface">
                   {next?.cta}
                   <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" className="rounded-xl px-4 gap-2 text-on-surface-variant opacity-60">
                 How it works
                 <ExternalLink className="h-3 w-3" />
              </Button>
           </div>
        </div>

      </div>
    </Card>
  )
}
