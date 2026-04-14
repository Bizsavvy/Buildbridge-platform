import * as React from "react"
import { 
  Shield, 
  Star, 
  User, 
  ShieldCheck, 
  BadgeCheck
} from "lucide-react"
import { cn } from "@/lib/utils"

export type BadgeLevelType = 0 | 1 | 2 | 3 | 4;

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  level: BadgeLevelType;
}

const levelConfig = {
  0: {
    bg: "bg-slate-100 border border-slate-200 text-slate-500",
    icon: Shield,
    label: "Unverified",
  },
  1: {
    bg: "bg-primary/10 border border-primary/30 text-primary",
    icon: User,
    label: "Community",
  },
  2: {
    bg: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600",
    icon: ShieldCheck,
    label: "Trusted",
  },
  3: {
    bg: "bg-amber-500/10 border border-amber-500/30 text-amber-600",
    icon: Star,
    label: "Established",
  },
  4: {
    bg: "bg-purple-500/10 border border-purple-500/30 text-purple-600",
    icon: BadgeCheck,
    label: "Verified",
  }
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, level, children, ...props }, ref) => {
    
    const { bg, icon: Icon, label } = levelConfig[level] || levelConfig[0];
    
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold text-sm shadow-sm transition-colors duration-200 hover:opacity-80 cursor-pointer",
          bg,
          className
        )}
        {...props}
      >
        <Icon className="h-4 w-4" />
        {children || label}
      </div>
    )
  }
)
Badge.displayName = "Badge"

export { Badge }