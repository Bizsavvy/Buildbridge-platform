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
          "rounded-2xl border border-outline-variant bg-surface text-on-surface shadow-sm",
          hoverLift && "transition-transform duration-200 hover:-translate-y-1 hover:shadow-md",
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

export { Card }
