import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverLift?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverLift = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border shadow-sm",
          hoverLift && "transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer",
          className
        )}
        style={{ 
          background: 'var(--color-surface-container)', 
          borderColor: 'var(--color-outline-variant)' 
        }}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

export { Card }