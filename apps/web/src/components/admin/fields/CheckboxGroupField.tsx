"use client";

import { useField } from "formik";
import type { ReactNode } from "react";

type Props = {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  help?: ReactNode;
};

/** Pick several (e.g. which services a package relates to). */
export function CheckboxGroupField({ name, label, options, help }: Props) {
  const [field, , helpers] = useField<string[]>(name);
  const value = field.value ?? [];
  const toggle = (v: string) =>
    void helpers.setValue(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
      <legend className="mb-1.5 p-0 text-sm font-semibold text-ink">{label}</legend>
      {help && <p className="m-0 -mt-1 text-[13px] text-ink-muted">{help}</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <label
            key={o.value}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-sand-300 bg-white px-3 text-[15px] has-[:checked]:border-gold-500 has-[:checked]:bg-gold-500/5"
          >
            <input
              type="checkbox"
              checked={value.includes(o.value)}
              onChange={() => toggle(o.value)}
              className="size-4 accent-cocoa-900"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
