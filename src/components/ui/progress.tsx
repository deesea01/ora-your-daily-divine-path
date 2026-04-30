import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** Visual variant. `gold` adds the sacred gradient + soft glow; `default` keeps primary fill. */
  variant?: "default" | "gold";
  /** Indicator height token. Defaults to h-2 for the modern minimal look. */
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
} as const;

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = "gold", size = "md", ...props }, ref) => {
  const indicatorClass =
    variant === "gold"
      ? "bg-gradient-gold shadow-[0_0_12px_-2px_hsl(var(--gold)/0.55)]"
      : "bg-primary";
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-secondary/70",
        sizeMap[size],
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-transform duration-700 ease-elegant",
          indicatorClass,
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
