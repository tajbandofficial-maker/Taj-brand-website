import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

import { errorTextClasses, fieldClasses, type FieldTone } from "./field-styles";

type Props = Omit<ComponentPropsWithoutRef<"input">, "id"> & {
  id: string;
  /** Accessible label (visually hidden: the design uses placeholders). */
  label: string;
  error?: string;
  tone?: FieldTone;
};

export function TextField({ id, label, error, tone = "light", className, ...input }: Props) {
  const errorId = `${id}-error`;
  // Date inputs ignore `placeholder`, and phones show an empty box. Draw the placeholder
  // ourselves while the field is empty and not focused, hiding the native "mm/dd/yyyy".
  const datePlaceholder =
    input.type === "date" && !input.value ? (input.placeholder ?? label) : undefined;
  return (
    <div className={cn(datePlaceholder !== undefined && "relative", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={fieldClasses(
          tone,
          Boolean(error),
          cn(
            "min-h-[52px]",
            input.type === "date" && "peer [&::-webkit-date-and-time-value]:text-left",
            datePlaceholder !== undefined && "[&:not(:focus)]:text-transparent",
          ),
        )}
        {...input}
      />
      {datePlaceholder !== undefined && (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-4 top-0 flex h-[52px] items-center text-base peer-focus:hidden",
            tone === "dark" ? "text-sand-400" : "text-ink-muted/70",
          )}
        >
          {datePlaceholder}
        </span>
      )}
      {error && (
        <p id={errorId} className={errorTextClasses(tone)}>
          {error}
        </p>
      )}
    </div>
  );
}
