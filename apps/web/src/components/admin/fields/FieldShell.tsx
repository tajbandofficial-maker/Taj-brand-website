import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Props = {
  id: string;
  label: string;
  help?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

/** Label + control + plain-language help + error, wired for screen readers. */
export function FieldShell({ id, label, help, error, required, className, children }: Props) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {required && <span className="text-[#b3261e]"> *</span>}
      </label>
      {children}
      {help && !error && (
        <p id={`${id}-help`} className="m-0 text-[13px] text-ink-muted">
          {help}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="m-0 text-[13px] font-medium text-[#b3261e]">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClasses = (invalid: boolean) =>
  cn(
    "w-full rounded-lg border bg-white px-3 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-muted/60",
    "focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30",
    invalid ? "border-[#b3261e]" : "border-sand-300",
  );

export function describedBy(id: string, error?: string, help?: unknown) {
  return error ? `${id}-error` : help ? `${id}-help` : undefined;
}
