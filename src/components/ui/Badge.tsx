import * as React from "react"
import { 
  Shield, 
  Star, 
  User, 
  ShieldCheck, 
  BadgeCheck,
  ShieldAlert
} from "lucide-react"
import { cn } from "@/lib/utils"

export type BadgeLevelType = 0 | 1 | 2 | 3 | 4;

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  level: BadgeLevelType;
}

const levelConfig = {
  0: {
    bg: "bg-surface border border-outline-variant text-on-surface-variant",
    icon: Shield,
    label: "Unverified",
    description: "New member, identity pending."
  },
  1: {
    bg: "bg-badge-1/10 border border-badge-1/30 text-badge-1",
    icon: User,
    label: "Community Member",
    description: "Onboarding complete."
  },
  2: {
    bg: "bg-badge-2/10 border border-badge-2/30 text-badge-2",
    icon: ShieldCheck,
    label: "Trusted Tradesperson",
    description: "2+ Community vouches."
  },
  3: {
    bg: "bg-badge-3/10 border border-badge-3/30 text-badge-3",
    icon: Star,
    label: "Established",
    description: "1+ Funded need delivered."
  },
  4: {
    bg: "bg-badge-4/10 border border-badge-4/30 text-badge-4",
    icon: BadgeCheck,
    label: "Platform Verified",
    description: "NIN/BVN biometric verified."
  }
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, level, children, ...props }, ref) => {
    
    const { bg, icon: Icon, label } = levelConfig[level] || levelConfig[0];
    
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-bold text-label-small shadow-sm transition-all hover:scale-105",
          bg,
          className
        )}
        {...props}
      >
        <div className="relative">
           <Icon className={cn("h-4 w-4", level === 0 && "stroke-1")} />
           {level === 2 && (
             <Shield className="h-2.5 w-2.5 absolute -top-1 -right-1 fill-badge-2/20 animate-pulse" />
           )}
           {level === 3 && (
             <Star className="h-2 w-2 absolute -top-0.5 -right-0.5 fill-current animate-bounce" />
           )}
        </div>
        {children || label}
      </div>
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
