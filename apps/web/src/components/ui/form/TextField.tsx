import type { ComponentPropsWithoutRef } from "react";

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
  return (
    <div className={className}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={fieldClasses(tone, Boolean(error), "min-h-[52px]")}
        {...input}
      />
      {error && (
        <p id={errorId} className={errorTextClasses(tone)}>
          {error}
        </p>
      )}
    </div>
  );
}
