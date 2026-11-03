import { cn } from "@/lib/cn";

import type { FieldTone } from "./field-styles";

type Option = { value: string; label: string };

type Props = {
  legend: string;
  /** Show the legend visually (contact form) or only to screen readers (home form). */
  showLegend?: boolean;
  options: Option[];
  value: string[];
  onChange: (next: string[]) => void;
  tone?: FieldTone;
};

/** Multi-select toggle chips (aria-pressed buttons) inside a fieldset. */
export function ChipGroup({
  legend,
  showLegend = false,
  options,
  value,
  onChange,
  tone = "light",
}: Props) {
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <fieldset className="m-0 border-0 p-0">
      <legend
        className={cn(
          showLegend ? "mb-2.5 text-sm font-semibold" : "sr-only",
          tone === "dark" ? "text-sand-200" : "text-ink-muted",
        )}
      >
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(o.value)}
              className={cn(
                "min-h-[42px] cursor-pointer rounded-full border border-gold-500 px-3.5 text-sm font-semibold transition-colors",
                tone === "dark"
                  ? on
                    ? "bg-gold-500 text-cocoa-900"
                    : "bg-transparent text-cream-50 hover:bg-gold-500/15"
                  : on
                    ? "bg-cocoa-900 text-cream-50"
                    : "bg-transparent text-cocoa-900 hover:bg-gold-500/10",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
