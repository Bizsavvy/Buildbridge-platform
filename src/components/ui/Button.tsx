import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", isLoading, children, disabled, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center rounded-full text-body-large transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline disabled:pointer-events-none disabled:opacity-50 min-h-[48px] px-6 py-2 font-medium";
    
    const variantStyles = {
      primary: "bg-primary text-on-primary hover:opacity-90",
      secondary: "bg-surface-variant text-on-surface-variant hover:opacity-90 border border-outline-variant",
      ghost: "bg-transparent text-primary hover:bg-surface-variant",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
