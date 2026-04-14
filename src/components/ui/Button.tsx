import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-semibold cursor-pointer";
    
    const sizeStyles = {
      sm: "min-h-[36px] px-4 py-1.5 text-sm",
      md: "min-h-[48px] px-6 py-2 text-base",
      lg: "min-h-[56px] px-8 py-3 text-lg",
    };

    const variantStyles = {
      primary: "shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5",
      secondary: "border-2 hover:opacity-80",
      ghost: "bg-transparent hover:opacity-80",
    };

    const getVariantStyles = () => {
      switch (variant) {
        case "primary":
          return { background: 'var(--color-primary)', color: 'var(--color-on-primary)' };
        case "secondary":
          return { background: 'var(--color-surface)', color: 'var(--color-primary)', borderColor: 'var(--color-outline-variant)' };
        case "ghost":
          return { background: 'transparent', color: 'var(--color-primary)' };
        default:
          return { background: 'var(--color-primary)', color: 'var(--color-on-primary)' };
      }
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], className)}
        style={getVariantStyles()}
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