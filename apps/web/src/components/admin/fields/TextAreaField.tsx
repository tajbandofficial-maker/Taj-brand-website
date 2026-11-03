"use client";

import { useField } from "formik";
import type { ReactNode } from "react";

import { describedBy, FieldShell, inputClasses } from "./FieldShell";

type Props = {
  name: string;
  label: string;
  help?: ReactNode;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  className?: string;
};

export function TextAreaField({
  name,
  label,
  help,
  required,
  rows = 4,
  maxLength,
  placeholder,
  className,
}: Props) {
  const [field, meta] = useField<string | null>(name);
  const id = `f-${name}`;
  const error = meta.touched ? meta.error : undefined;
  const length = (field.value ?? "").length;
  return (
    <FieldShell
      id={id}
      label={label}
      help={
        maxLength ? (
          <>
            {help} {help && "· "}
            {length}/{maxLength}
          </>
        ) : (
          help
        )
      }
      error={error}
      required={required}
      className={className}
    >
      <textarea
        id={id}
        {...field}
        value={field.value ?? ""}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, help || maxLength)}
        className={`${inputClasses(Boolean(error))} resize-y py-2.5 leading-relaxed`}
      />
    </FieldShell>
  );
}
