"use client";

import { useField } from "formik";
import type { ReactNode } from "react";

import { describedBy, FieldShell, inputClasses } from "./FieldShell";

type Props = {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  help?: ReactNode;
  required?: boolean;
  /** Label for an empty choice (value ""), e.g. "None". Omit to require a choice. */
  emptyLabel?: string;
  className?: string;
};

export function SelectField({
  name,
  label,
  options,
  help,
  required,
  emptyLabel,
  className,
}: Props) {
  const [field, meta] = useField<string | null>(name);
  const id = `f-${name}`;
  const error = meta.touched ? meta.error : undefined;
  return (
    <FieldShell
      id={id}
      label={label}
      help={help}
      error={error}
      required={required}
      className={className}
    >
      <select
        id={id}
        {...field}
        value={field.value ?? ""}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, help)}
        className={`${inputClasses(Boolean(error))} min-h-11 cursor-pointer`}
      >
        {emptyLabel !== undefined && <option value="">{emptyLabel}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
