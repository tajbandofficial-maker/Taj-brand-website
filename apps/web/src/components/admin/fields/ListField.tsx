"use client";

import { useField } from "formik";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import type { ReactNode } from "react";

import { AdminButton } from "../AdminButton";
import { inputClasses } from "./FieldShell";

type Props = {
  name: string;
  label: string;
  help?: ReactNode;
  addLabel?: string;
  placeholder?: string;
  maxItems?: number;
  maxLength?: number;
};

/** Editable list of short texts (inclusions, service areas, ticker words…). */
export function ListField({
  name,
  label,
  help,
  addLabel = "Add item",
  placeholder,
  maxItems = 20,
  maxLength = 160,
}: Props) {
  const [field, meta, helpers] = useField<string[]>(name);
  const items = field.value ?? [];
  const error = meta.touched && typeof meta.error === "string" ? meta.error : undefined;
  const set = (next: string[]) => void helpers.setValue(next);
  const move = (i: number, d: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d]!, next[i]!];
    set(next);
  };

  return (
    <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
      <legend className="mb-1.5 p-0 text-sm font-semibold text-ink">{label}</legend>
      {help && <p className="m-0 -mt-1 text-[13px] text-ink-muted">{help}</p>}
      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span className="w-6 text-right text-sm text-ink-muted">{i + 1}.</span>
            <input
              aria-label={`${label} ${i + 1}`}
              value={item}
              maxLength={maxLength}
              placeholder={placeholder}
              onChange={(e) => set(items.map((x, j) => (j === i ? e.target.value : x)))}
              className={`${inputClasses(false)} min-h-10 flex-1`}
            />
            <AdminButton
              size="sm"
              variant="ghost"
              aria-label="Move up"
              disabled={i === 0}
              onClick={() => move(i, -1)}
            >
              <ArrowUp aria-hidden="true" className="size-4" />
            </AdminButton>
            <AdminButton
              size="sm"
              variant="ghost"
              aria-label="Move down"
              disabled={i === items.length - 1}
              onClick={() => move(i, 1)}
            >
              <ArrowDown aria-hidden="true" className="size-4" />
            </AdminButton>
            <AdminButton
              size="sm"
              variant="ghost"
              aria-label={`Remove item ${i + 1}`}
              onClick={() => set(items.filter((_, j) => j !== i))}
            >
              <X aria-hidden="true" className="size-4" />
            </AdminButton>
          </li>
        ))}
      </ol>
      {items.length < maxItems && (
        <AdminButton size="sm" className="self-start" onClick={() => set([...items, ""])}>
          <Plus aria-hidden="true" className="size-4" />
          {addLabel}
        </AdminButton>
      )}
      {error && <p className="m-0 text-[13px] font-medium text-[#b3261e]">{error}</p>}
    </fieldset>
  );
}
