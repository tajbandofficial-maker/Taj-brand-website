"use client";

import { useField } from "formik";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { describedBy, FieldShell, inputClasses } from "./FieldShell";

type Props = Omit<ComponentPropsWithoutRef<"input">, "name"> & {
  name: string;
  label: string;
  help?: ReactNode;
};

export function TextField({ name, label, help, required, className, ...input }: Props) {
  const [field, meta] = useField<string | number | null>(name);
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
      <input
        id={id}
        {...field}
        value={field.value ?? ""}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, help)}
        className={`${inputClasses(Boolean(error))} min-h-11`}
        {...input}
      />
    </FieldShell>
  );
}
