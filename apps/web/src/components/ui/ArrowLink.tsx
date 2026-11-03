import Link from "next/link";

import { cn } from "@/lib/cn";

type Props = {
  href: string;
  label: string;
  tone?: "light" | "dark";
  className?: string;
};

/** "See all →" style text link. External URLs open in the same tab (tel/wa) or new tab (http). */
export function ArrowLink({ href, label, tone = "light", className }: Props) {
  const classes = cn(
    "inline-flex min-h-11 items-center text-[15px] font-semibold transition-colors",
    tone === "dark" ? "text-gold-300 hover:text-cream-50" : "text-gold-700 hover:text-cocoa-800",
    className,
  );
  const text = `${label} →`;
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={classes}>
        {text}
      </Link>
    );
  }
  return (
    <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
  );
}
