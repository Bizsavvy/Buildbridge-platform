import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg";
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, name, size = "md", ...props }, ref) => {
    
    const sizeStyles = {
      sm: "h-8 w-8 text-sm",
      md: "h-12 w-12 text-base",
      lg: "h-16 w-16 text-xl",
    };

    const getInitials = (n?: string) => {
      if (!n) return "?"
      return n.split(" ").map(word => word[0]).join("").substring(0, 2).toUpperCase()
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full bg-surface-variant text-on-surface-variant",
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={name || "Avatar"}
            className="aspect-square h-full w-full object-cover"
            onError={(e) => {
               e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-medium">
            {getInitials(name)}
          </span>
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

export { Avatar }