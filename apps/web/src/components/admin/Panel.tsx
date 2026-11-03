import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Props = { title?: string; description?: ReactNode; className?: string; children: ReactNode };

/** White card that groups related fields or content. */
export function Panel({ title, description, className, children }: Props) {
  return (
    <section className={cn("rounded-xl border border-line bg-white p-5 sm:p-6", className)}>
      {(title || description) && (
        <header className="mb-5 flex flex-col gap-1">
          {title && <h2 className="m-0 font-sans text-base font-bold text-cocoa-900">{title}</h2>}
          {description && <p className="m-0 text-sm text-ink-muted">{description}</p>}
        </header>
      )}
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}
