import { cn } from "@/lib/cn";

export type FieldTone = "light" | "dark";

/** Shared input/textarea styling for both form placements in the design. */
export function fieldClasses(tone: FieldTone, invalid: boolean, extra?: string): string {
  return cn(
    "w-full rounded-xl border px-4 text-base outline-none transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500",
    tone === "dark"
      ? "border-sand-200/30 bg-white/[0.06] text-cream-50 placeholder:text-sand-400 [color-scheme:dark]"
      : "border-sand-300 bg-white text-ink placeholder:text-ink-muted/70",
    invalid && (tone === "dark" ? "border-[#ff8a80]" : "border-[#b3261e]"),
    extra,
  );
}

export function errorTextClasses(tone: FieldTone): string {
  return cn(
    "mt-1.5 text-[13px] font-medium",
    tone === "dark" ? "text-[#ffb4ab]" : "text-[#b3261e]",
  );
}
