import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, ...props }, ref) => {
    const defaultId = React.useId();
    const inputId = id || defaultId;

    return (
      <div className="flex w-full flex-col gap-2">
        {label && (
          <label 
            htmlFor={inputId} 
            className="text-base font-medium text-on-surface"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            "flex h-14 w-full rounded-xl border bg-white px-4 py-2 text-base text-on-surface transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
            error 
              ? "border-error focus-visible:ring-error" 
              : "border-outline focus-visible:border-primary",
            className
          )}
          ref={ref}
          {...props}
        />
        {error ? (
          <p className="text-sm text-error">{error}</p>
        ) : helperText ? (
          <p className="text-sm text-on-surface-variant">{helperText}</p>
        ) : null}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }