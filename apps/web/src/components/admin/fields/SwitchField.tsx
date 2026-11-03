"use client";

import { useField } from "formik";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Props = { name: string; label: string; help?: ReactNode };

/** On/off toggle (a checkbox styled as a switch). */
export function SwitchField({ name, label, help }: Props) {
  const [field, , helpers] = useField<boolean>(name);
  const id = `f-${name}`;
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={field.value}
        aria-describedby={help ? `${id}-help` : undefined}
        onClick={() => void helpers.setValue(!field.value)}
        className={cn(
          "relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
          field.value ? "bg-[#1d6b38]" : "bg-sand-300",
        )}
      >
        <span
          className={cn(
            "inline-block size-5 rounded-full bg-white shadow transition-transform",
            field.value ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </button>
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="cursor-pointer text-sm font-semibold text-ink">
          {label}
        </label>
        {help && (
          <p id={`${id}-help`} className="m-0 text-[13px] text-ink-muted">
            {help}
          </p>
        )}
      </div>
    </div>
  );
}
