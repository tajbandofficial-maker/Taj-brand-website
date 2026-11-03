import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Props = { variant?: "outline" | "highlight"; className?: string; children: ReactNode };

/** Rounded badge: gold-outline trust chips on dark, or a yellow "Most booked" tag. */
export function Pill({ variant = "outline", className, children }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full",
        variant === "outline"
          ? "border border-gold-500/50 px-3 py-1.5 text-[12.5px] font-semibold"
          : "bg-sun-400 px-2.5 py-[5px] text-[11px] font-bold tracking-[0.1em] text-cocoa-900 uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}
