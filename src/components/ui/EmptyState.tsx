import * as React from "react"
import { Button } from "./Button"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-surface-variant/30 border border-dashed border-outline-variant",
        className
      )}
    >
      {Icon && (
        <div className="mb-4 rounded-full bg-surface p-4 text-primary shadow-sm">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <h3 className="text-headline-small text-on-surface font-bold mb-2">
        {title}
      </h3>
      <p className="text-body-large text-on-surface-variant max-w-md mb-8">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
