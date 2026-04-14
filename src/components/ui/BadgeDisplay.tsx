import * as React from "react"
import { Badge, type BadgeLevelType } from "./Badge"
import { Card } from "./Card"
import { Info, ShieldCheck, Star, User, Lock } from "lucide-react"

export function BadgeDisplay() {
  const levels: { level: BadgeLevelType; criteria: string; impact: string }[] = [
    { 
      level: 0, 
      criteria: "Signed up to BuildBridge.", 
      impact: "Can browse needs and follow tradespeople." 
    },
    { 
      level: 1, 
      criteria: "Onboarding & Profile photo added.", 
      impact: "Can create first funding request (Need)." 
    },
    { 
      level: 2, 
      criteria: "2 Community vouches verified.", 
      impact: "Higher visibility in the Browse feed." 
    },
    { 
      level: 3, 
      criteria: "1 Need fully funded & Proof-of-use uploaded.", 
      impact: "Eligible for larger grant amounts." 
    },
    { 
      level: 4, 
      criteria: "Biometric Government ID (NIN) verified.", 
      impact: "Priority funding & Instant payout status." 
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
         <h2 className="text-display-small font-black text-on-surface">The Trust Ladder</h2>
         <p className="text-body-large text-on-surface-variant">Build your reputation to unlock higher funding limits and faster payouts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {levels.map((item) => (
          <Card key={item.level} className="p-5 flex flex-col gap-4 bg-surface border-outline-variant/30 hover:border-primary/50 transition-all group">
             <Badge level={item.level} />
             <div className="flex flex-col gap-1.5">
                <p className="text-label-small uppercase font-black text-on-surface-variant tracking-widest">Requirement</p>
                <p className="text-body-small font-medium text-on-surface leading-snug">{item.criteria}</p>
             </div>
             <div className="p-3 bg-surface-variant/30 rounded-xl mt-auto">
                <p className="text-label-small font-bold text-primary mb-1">Impact:</p>
                <p className="text-body-small text-on-surface-variant italic">{item.impact}</p>
             </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
