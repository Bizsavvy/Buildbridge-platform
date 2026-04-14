import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  percentage: number;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, percentage, ...props }, ref) => {
    
    // Cap at 100 for visual bounds, though BuildBridge allows 110% overfunding
    const boundedPct = Math.min(Math.max(percentage, 0), 100);
    
    let colorClass = "bg-badge-1"; // Blue
    if (percentage >= 100) {
      colorClass = "bg-badge-4"; // Purple (fully funded)
    } else if (percentage >= 50) {
      colorClass = "bg-badge-2"; // Green (halfway/progressing)
    }

    return (
      <div
        ref={ref}
        className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-variant", className)}
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
