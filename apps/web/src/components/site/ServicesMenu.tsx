"use client";

import type { ServiceCard } from "@taj/types";
import { ArrowRight, ChevronDown, Crown, Music2, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { ImageFrame } from "@/components/ui/ImageFrame";
import { cn } from "@/lib/cn";
import {
  groupServicesForMenu,
  isActivePath,
  serviceHref,
  type ServiceMenuGroupKey,
} from "@/lib/navigation";

export type MenuService = Pick<ServiceCard, "slug" | "title" | "shortDescription" | "image">;

export const groupIcons: Record<ServiceMenuGroupKey, typeof Music2> = {
  music: Music2,
  rides: Crown,
  more: Sparkles,
};

/**
 * Desktop "Services" mega-menu. The word links to /services; hovering the item or pressing
 * the chevron opens a panel of grouped services with a photo preview of the one in focus.
 */
export function ServicesMenu({ services }: { services: MenuService[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const panelId = useId();

  const groups = useMemo(() => groupServicesForMenu(services), [services]);
  const active = isActivePath(pathname, "/services");
  const shown = services[preview] ?? services[0];

  // Close on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Escape closes (focus back on the chevron); a click elsewhere closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const hoverOpen = (e: ReactPointerEvent) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hoverClose = (e: ReactPointerEvent) => {
    if (e.pointerType !== "mouse") return;
    closeTimer.current = window.setTimeout(() => setOpen(false), 160);
  };

  if (services.length === 0) return null;

  return (
    <div
      ref={wrapRef}
      onPointerEnter={hoverOpen}
      onPointerLeave={hoverClose}
      // Tabbing out of the menu closes it.
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
      className="flex items-center"
    >
      <Link
        href="/services"
        aria-current={pathname === "/services" ? "page" : undefined}
        className={cn(
          "border-b-2 py-1.5 transition-colors",
          active || open
            ? "border-gold-500 text-gold-300"
            : "border-transparent text-sand-200 hover:text-gold-300",
        )}
      >
        Services
      </Link>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Show all services"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "-mr-1 ml-0.5 flex size-7 cursor-pointer items-center justify-center rounded-md transition-colors",
          open ? "text-gold-300" : "text-sand-200 hover:text-gold-300",
        )}
      >
        <ChevronDown
          aria-hidden="true"
          className={cn("size-4 transition-transform duration-300", open && "rotate-180")}
        />
      </button>

      {/* Panel — spans the header's content width, just below it. */}
      <div
        id={panelId}
        inert={!open}
        className={cn(
          "absolute inset-x-[clamp(16px,4vw,32px)] top-full pt-2 transition-[opacity,translate,visibility] duration-300 ease-out",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
        )}
      >
        <div className="relative overflow-hidden rounded-[20px] border border-gold-500/35 bg-cocoa-900/95 shadow-[0_30px_80px_rgb(0_0_0/0.5)] backdrop-blur-xl">
          {/* Gold hairline + glow along the top edge. */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-300/80 to-transparent"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 left-1/3 size-80 rounded-full bg-gold-500/10 blur-[90px]"
          />

          <div className="relative grid grid-cols-[minmax(0,1fr)_260px] gap-7 p-7 xl:grid-cols-[minmax(0,1fr)_300px]">
            {/* Grouped links */}
            <div className="grid grid-cols-3 gap-x-6 gap-y-2">
              {groups.map((g) => {
                const Icon = groupIcons[g.key];
                return (
                  <div key={g.key} className="flex min-w-0 flex-col">
                    <p className="m-0 mb-2 flex items-center gap-2 border-b border-gold-500/20 pb-2.5 text-[11px] font-bold tracking-[0.16em] text-gold-300 uppercase">
                      <Icon aria-hidden="true" className="size-3.5" />
                      {g.label}
                    </p>
                    <ul className="m-0 flex list-none flex-col p-0">
                      {g.items.map((s) => {
                        const idx = services.indexOf(s);
                        const here = isActivePath(pathname, serviceHref(s.slug));
                        return (
                          <li key={s.slug}>
                            <Link
                              href={serviceHref(s.slug)}
                              aria-current={here ? "page" : undefined}
                              onPointerEnter={() => setPreview(idx)}
                              onFocus={() => setPreview(idx)}
                              className={cn(
                                "group/item flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14.5px] transition-colors",
                                here
                                  ? "bg-gold-500/15 text-gold-300"
                                  : "text-sand-200 hover:bg-white/[0.06] hover:text-cream-50 focus-visible:bg-white/[0.06]",
                              )}
                            >
                              <span
                                aria-hidden="true"
                                className={cn(
                                  "size-1.5 shrink-0 rounded-full transition-[background-color,transform] duration-300",
                                  here || shown?.slug === s.slug
                                    ? "scale-125 bg-gold-300"
                                    : "bg-gold-500/40 group-hover/item:bg-gold-300",
                                )}
                              />
                              <span className="truncate">{s.title}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Preview of the service in focus */}
            {shown && (
              <div className="flex flex-col overflow-hidden rounded-2xl border border-gold-500/30 bg-cocoa-800/70">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <ImageFrame
                    key={shown.slug}
                    image={shown.image}
                    sizes="300px"
                    className="size-full animate-lb-fade"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-cocoa-900/85 via-transparent to-transparent"
                  />
                  <span className="absolute right-4 bottom-3 left-4 font-serif text-[22px] leading-tight text-cream-50">
                    {shown.title}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <p className="m-0 line-clamp-3 text-[13.5px] leading-relaxed text-sand-200">
                    {shown.shortDescription}
                  </p>
                  <Link
                    href={serviceHref(shown.slug)}
                    className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300 hover:text-gold-500"
                  >
                    View service <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Footer strip */}
          <div className="relative flex items-center justify-between gap-4 border-t border-gold-500/20 bg-black/20 px-7 py-3.5 text-sm">
            <span className="text-sand-400">
              {services.length} services — book one, or combine them into a single baraat.
            </span>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 font-semibold text-gold-300 hover:text-gold-500"
            >
              All services <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
