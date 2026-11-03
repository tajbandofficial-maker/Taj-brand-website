"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useId, useState } from "react";

import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { groupServicesForMenu, isActivePath, primaryNav, serviceHref } from "@/lib/navigation";
import { useUiStore } from "@/stores/ui-store";

import { groupIcons, type MenuService, ServicesMenu } from "./ServicesMenu";

/** Desktop links + mobile disclosure panel. Breakpoint: 860px (`nav:`). */
export function SiteNav({ logo, services }: { logo: ReactNode; services: MenuService[] }) {
  const pathname = usePathname();
  const open = useUiStore((s) => s.navOpen);
  const toggle = useUiStore((s) => s.toggleNav);
  const close = useUiStore((s) => s.closeNav);
  const panelId = useId();
  const mobileServicesId = useId();
  const [servicesOpen, setServicesOpen] = useState(false);
  const serviceGroups = groupServicesForMenu(services);

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
      <div className="relative mx-auto flex max-w-[1200px] items-center justify-between gap-5 px-[clamp(16px,4vw,32px)] py-2.5">
        {logo}

        <nav
          aria-label="Main"
          className="hidden items-center gap-[clamp(14px,1.8vw,26px)] text-sm font-medium nav:flex"
        >
          {primaryNav.map((item) => {
            if (item.href === "/services" && services.length > 0) {
              return <ServicesMenu key={item.href} services={services} />;
            }
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
        // The header is sticky: cap the open menu at the screen height and let it scroll;
        // bottom padding lets the last link scroll clear of the sticky Call / WhatsApp bar.
        className="max-h-[calc(100dvh-66px)] flex-col overflow-y-auto overscroll-contain px-4 pt-1 pb-24 text-[17px] font-medium nav:hidden [&:not([hidden])]:flex"
      >
        {primaryNav.map((item) => {
          const { active, ...aria } = linkState(item.href);
          if (item.href === "/services" && serviceGroups.length > 0) {
            return (
              <div key={item.href} className="border-b border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <Link
                    href={item.href}
                    {...aria}
                    className={cn("flex-1 py-3.5", active ? "text-gold-300" : "text-cream-50")}
                  >
                    {item.label}
                  </Link>
                  <button
                    type="button"
                    aria-label={servicesOpen ? "Hide services" : "Show services"}
                    aria-expanded={servicesOpen}
                    aria-controls={mobileServicesId}
                    onClick={() => setServicesOpen((o) => !o)}
                    className="-mr-2 flex size-11 cursor-pointer items-center justify-center rounded-[10px] text-gold-300"
                  >
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        "size-5 transition-transform duration-300",
                        servicesOpen && "rotate-180",
                      )}
                    />
                  </button>
                </div>
                {/* Expands with a height transition (grid 0fr → 1fr). */}
                <div
                  id={mobileServicesId}
                  inert={!servicesOpen}
                  className={cn(
                    "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                    servicesOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="flex flex-col gap-4 pb-4">
                      {serviceGroups.map((g) => {
                        const Icon = groupIcons[g.key];
                        return (
                          <div key={g.key}>
                            <p className="m-0 mb-1.5 flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-gold-300 uppercase">
                              <Icon aria-hidden="true" className="size-3.5" />
                              {g.label}
                            </p>
                            <ul className="m-0 grid list-none grid-cols-2 gap-x-3 p-0">
                              {g.items.map((s) => {
                                const here = isActivePath(pathname, serviceHref(s.slug));
                                return (
                                  <li key={s.slug}>
                                    <Link
                                      href={serviceHref(s.slug)}
                                      aria-current={here ? "page" : undefined}
                                      className={cn(
                                        "block py-2 text-[15px]",
                                        here ? "text-gold-300" : "text-sand-200",
                                      )}
                                    >
                                      {s.title}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          }
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
