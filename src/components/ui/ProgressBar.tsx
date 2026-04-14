import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  percentage: number;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, percentage, ...props }, ref) => {
    
    const boundedPct = Math.min(Math.max(percentage, 0), 100);
    
    const getBarColor = () => {
      if (percentage >= 100) return '#16a34a'; // success green
      if (percentage >= 50) return 'var(--color-primary)';
      return 'var(--color-primary)';
    };

    return (
      <div
        ref={ref}
        className={cn("h-2 w-full overflow-hidden rounded-full", className)}
        style={{ background: 'var(--color-surface-variant)' }}
        {...props}
      >
        <div
          className="h-full transition-all duration-1000 ease-out"
          style={{ width: `${boundedPct}%`, background: getBarColor() }}
        />
      </div>
    )
  }
)
ProgressBar.displayName = "ProgressBar"

export { ProgressBar }