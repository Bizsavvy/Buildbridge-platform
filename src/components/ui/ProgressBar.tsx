import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  percentage: number;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, percentage, ...props }, ref) => {
    
    const boundedPct = Math.min(Math.max(percentage, 0), 100);
    
    let colorClass = "bg-primary";
    if (percentage >= 100) {
      colorClass = "bg-emerald-500";
    } else if (percentage >= 50) {
      colorClass = "bg-primary";
    }

    return (
      <div
        ref={ref}
        className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}
        {...props}
      >
        <div
          className={cn("h-full transition-all duration-1000 ease-out", colorClass)}
          style={{ width: `${boundedPct}%` }}
        />
      </div>
    )
  }
)
ProgressBar.displayName = "ProgressBar"

export { ProgressBar }