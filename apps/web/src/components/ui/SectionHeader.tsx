import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { ArrowLink } from "./ArrowLink";
import { Eyebrow } from "./Eyebrow";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: { label: string; href: string };
  tone?: "light" | "dark";
  as?: "h1" | "h2";
  /** "page" for H1 heroes, "section" for main H2s, "sub" for smaller H2s. */
  size?: "page" | "section" | "sub";
  /** Extra content placed opposite the title (e.g. a rating summary). */
  aside?: ReactNode;
  className?: string;
};

const titleSizes = { page: "text-page", section: "text-section", sub: "text-subsection" } as const;

/** Eyebrow + serif heading (+ description / "see all" link) used by every section. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  tone = "light",
  as: Tag = "h2",
  size = "section",
  aside,
  className,
}: Props) {
  const dark = tone === "dark";
  const side =
    aside ?? (action && <ArrowLink href={action.href} label={action.label} tone={tone} />);

  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="flex max-w-[680px] flex-col gap-2.5">
        {eyebrow && <Eyebrow tone={tone}>{eyebrow}</Eyebrow>}
        <Tag className={cn("m-0", titleSizes[size], dark ? "text-cream-50" : "text-cocoa-900")}>
          {title}
        </Tag>
        {description && (
          <p
            className={cn(
              "m-0 text-base leading-relaxed",
              dark ? "text-sand-200" : "text-ink-muted",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {side}
    </div>
  );
}
