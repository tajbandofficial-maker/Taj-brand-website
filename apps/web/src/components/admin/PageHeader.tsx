import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: ReactNode;
  back?: { href: string; label: string };
  actions?: ReactNode;
};

export function PageHeader({ title, description, back, actions }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-3">
      {back && (
        <Link
          href={back.href}
          className="inline-flex items-center gap-1 self-start text-sm font-medium text-ink-muted hover:text-ink"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex max-w-2xl flex-col gap-1">
          <h1 className="m-0 font-serif text-3xl text-cocoa-900">{title}</h1>
          {description && <p className="m-0 text-[15px] text-ink-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
