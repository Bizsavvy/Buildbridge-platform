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

const levelConfig: Record<number, { bg: string; color: string; icon: React.ElementType; label: string }> = {
  0: {
    bg: 'var(--color-surface-variant)',
    color: 'var(--color-on-surface-variant)',
    icon: Shield,
    label: "Unverified",
  },
  1: {
    bg: 'var(--color-primary-container)',
    color: 'var(--color-on-primary-container)',
    icon: User,
    label: "Community",
  },
  2: {
    bg: '#dcfce7',
    color: '#166534',
    icon: ShieldCheck,
    label: "Trusted",
  },
  3: {
    bg: '#fef3c7',
    color: '#92400e',
    icon: Star,
    label: "Established",
  },
  4: {
    bg: 'var(--color-primary-container)',
    color: 'var(--color-on-primary-container)',
    icon: BadgeCheck,
    label: "Verified",
  }
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, level, children, ...props }, ref) => {
    
    const config = levelConfig[level] || levelConfig[0];
    const Icon = config.icon;
    
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold text-sm shadow-sm transition-colors duration-200 hover:opacity-80 cursor-pointer",
          className
        )}
        style={{ background: config.bg, color: config.color }}
        {...props}
      >
        <Icon className="h-4 w-4" />
        {children || config.label}
      </div>
    )
  }
)
Badge.displayName = "Badge"

export { Badge }