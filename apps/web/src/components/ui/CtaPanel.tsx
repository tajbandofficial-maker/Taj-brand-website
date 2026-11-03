import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Props = {
  title: ReactNode;
  text?: ReactNode;
  actions: ReactNode;
  /** "panel" = large bordered block; "bar" = compact one-line strip. */
  variant?: "panel" | "bar";
  className?: string;
};

/** Dark conversion block that closes a section ("Ready to book?" + buttons). */
export function CtaPanel({ title, text, actions, variant = "panel", className }: Props) {
  if (variant === "bar") {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 rounded-[18px] bg-cocoa-900 px-7 py-6 text-cream-50",
          className,
        )}
      >
        <p className="m-0 font-serif text-[clamp(22px,3vw,28px)] leading-tight">{title}</p>
        <div className="flex flex-wrap gap-3">{actions}</div>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-5 rounded-[22px] border border-gold-500 bg-cocoa-900 p-[clamp(24px,5vw,44px)] text-cream-50",
        className,
      )}
    >
      <div className="flex max-w-[560px] flex-col gap-2">
        <p className="m-0 font-serif text-[clamp(26px,3.5vw,36px)] leading-[1.1]">{title}</p>
        {text && <p className="m-0 text-[15px] leading-[1.55] text-sand-200">{text}</p>}
      </div>
      <div className="flex flex-wrap gap-3">{actions}</div>
    </div>
  );
}
