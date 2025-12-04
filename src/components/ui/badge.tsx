import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        premium:
          "border-white/20 bg-white/10 text-white backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:bg-white/20 hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all duration-300 animate-pulse-slow",
        beta: "border-transparent bg-gradient-to-r from-[#FF0080] to-[#7928CA] text-white shadow-[0_4px_15px_rgba(255,0,128,0.4)] hover:shadow-[0_6px_20px_rgba(255,0,128,0.6)] hover:scale-105 transition-all duration-300 tracking-widest uppercase",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
