import type { ComponentPropsWithoutRef } from "react";

import { errorTextClasses, fieldClasses, type FieldTone } from "./field-styles";

type Props = Omit<ComponentPropsWithoutRef<"textarea">, "id"> & {
  id: string;
  label: string;
  error?: string;
  tone?: FieldTone;
};

export function TextAreaField({ id, label, error, tone = "light", className, ...textarea }: Props) {
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={fieldClasses(tone, Boolean(error), "resize-y py-3.5")}
        {...textarea}
      />
      {error && (
        <p id={errorId} className={errorTextClasses(tone)}>
          {error}
        </p>
      )}
    </div>
  );
}
