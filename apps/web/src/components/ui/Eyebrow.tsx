import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Props = { tone?: "light" | "dark"; className?: string; children: ReactNode };

/** Small uppercase label above headings. */
export function Eyebrow({ tone = "light", className, children }: Props) {
  return (
    <span
      className={cn(
        "text-xs font-bold tracking-[0.16em] uppercase",
        tone === "dark" ? "text-gold-300" : "text-gold-700",
        className,
      )}
    >
      {children}
    </span>
  );
}
