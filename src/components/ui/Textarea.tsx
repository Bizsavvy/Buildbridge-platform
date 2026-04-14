import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const defaultId = React.useId();
    const textareaId = id || defaultId;

    return (
      <div className="flex w-full flex-col gap-2">
        {label && (
          <label 
            htmlFor={textareaId} 
            className="text-label-large text-on-surface"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            "flex min-h-[120px] w-full rounded-md border bg-transparent px-4 py-3 text-body-large text-on-surface transition-colors placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
            error 
              ? "border-error focus-visible:ring-error" 
              : "border-outline focus-visible:border-transparent focus-visible:ring-primary",
            className
          )}
          ref={ref}
          {...props}
        />
        {error ? (
          <p className="text-body-small text-error">{error}</p>
        ) : helperText ? (
          <p className="text-body-small text-on-surface-variant">{helperText}</p>
        ) : null}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
