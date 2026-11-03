"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useId } from "react";

import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { isActivePath, primaryNav } from "@/lib/navigation";
import { useUiStore } from "@/stores/ui-store";

/** Desktop links + mobile disclosure panel. Breakpoint: 860px (`nav:`). */
export function SiteNav({ logo }: { logo: ReactNode }) {
  const pathname = usePathname();
  const open = useUiStore((s) => s.navOpen);
  const toggle = useUiStore((s) => s.toggleNav);
  const close = useUiStore((s) => s.closeNav);
  const panelId = useId();

  // Close on navigation and on Escape.
  useEffect(() => close(), [pathname, close]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const linkState = (href: string) => {
    const active = isActivePath(pathname, href);
    return { active, "aria-current": active ? ("page" as const) : undefined };
  };

  return (
    <>
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-5 px-[clamp(16px,4vw,32px)] py-2.5">
        {logo}

        <nav
          aria-label="Main"
          className="hidden items-center gap-[clamp(14px,1.8vw,26px)] text-sm font-medium nav:flex"
        >
          {primaryNav.map((item) => {
            const { active, ...aria } = linkState(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                {...aria}
                className={cn(
                  "border-b-2 py-1.5 transition-colors",
                  active
                    ? "border-gold-500 text-gold-300"
                    : "border-transparent text-sand-200 hover:text-gold-300",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <ButtonLink href="/contact" size="sm">
            Check your date
          </ButtonLink>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggle}
          className="flex size-11 cursor-pointer items-center justify-center rounded-[10px] border border-gold-500/50 text-xl text-cream-50 nav:hidden"
        >
          <span aria-hidden="true">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      <nav
        id={panelId}
        aria-label="Mobile"
        hidden={!open}
        className="flex-col px-4 pt-1 pb-4 text-[17px] font-medium nav:hidden [&:not([hidden])]:flex"
      >
        {primaryNav.map((item) => {
          const { active, ...aria } = linkState(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              {...aria}
              className={cn(
                "border-b border-white/[0.08] py-3.5",
                active ? "text-gold-300" : "text-cream-50",
              )}
            >
              {item.label}
            </Link>
          );
        })}
        <ButtonLink href="/contact" size="lg" fullWidth className="mt-3.5">
          Check your date
        </ButtonLink>
      </nav>
    </>
  );
}
