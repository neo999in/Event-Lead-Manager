import * as React from "react";
import { cn } from "@/lib/utils";

export const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 rounded-control font-medium type-sm transition-app select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2";

    const variants = {
      // Primary: Single accent
      default:
        "bg-[var(--accent)] text-[var(--fg-on-accent)] hover:opacity-90 active:scale-[0.98] border border-transparent shadow-none",
      // Secondary: Crisp border, subtle bg
      secondary:
        "bg-app-subtle text-app-primary border border-app hover:bg-app-muted active:scale-[0.98]",
      // Outline: High contrast border
      outline:
        "bg-transparent text-app-primary border border-app hover:bg-app-subtle active:scale-[0.98]",
      // Ghost: Subdued utility
      ghost:
        "bg-transparent text-app-muted hover:text-app-primary hover:bg-app-subtle",
      // Destructive
      destructive:
        "bg-[var(--status-error-bg)] text-[var(--status-error-fg)] border border-[var(--status-error-border)] hover:opacity-90 active:scale-[0.98]",
    };

    const sizes = {
      default: "h-9 px-3.5 min-h-[36px] sm:min-h-[36px] min-w-[36px]",
      sm: "h-8 px-2.5 type-xs min-h-[32px]",
      lg: "h-11 px-5 type-base min-h-[44px]",
      icon: "h-9 w-9 min-h-[36px] min-w-[36px] p-0",
      mobile: "h-11 px-4 type-sm min-h-[44px]", // for touch friendly targets
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
