import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info" | "gold";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-cream-100 text-ink-muted",
  success: "bg-[#e3f4e8] text-[#1d6b38]",
  warning: "bg-[#fdf0d5] text-[#8a5a00]",
  danger: "bg-[#fdecea] text-[#b3261e]",
  info: "bg-[#e6eefc] text-[#1f4fa8]",
  gold: "bg-gold-500/15 text-gold-700",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function PublishedBadge({ published }: { published: boolean }) {
  return <Badge tone={published ? "success" : "neutral"}>{published ? "Live" : "Hidden"}</Badge>;
}
