"use client";

import { CalendarHeart, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/cn";

import { InquiryForm } from "./InquiryForm";

type Props = {
  serviceOptions: { value: string; label: string }[];
  whatsappHref: string;
};

/** Pages that already show the enquiry form prominently. */
const HIDDEN_ON = new Set(["/contact"]);

/**
 * "Enquire now" pill fixed bottom-left that toggles a floating enquiry window
 * just above it (chat-widget style). The page stays usable while it's open;
 * Esc, a click outside, ✕ or the pill itself closes it.
 */
export function FloatingEnquiry({ serviceOptions, whatsappHref }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // New key per opening, so a sent form starts fresh next time.
  const [formKey, setFormKey] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const titleId = useId();

  // Close when navigating to another page (state adjusted during render, not in an effect).
  const [openedOn, setOpenedOn] = useState(pathname);
  if (openedOn !== pathname) {
    setOpenedOn(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    // Start typing straight away.
    panelRef.current?.querySelector<HTMLInputElement>("input:not([tabindex='-1'])")?.focus();

    const close = () => {
      setOpen(false);
      toggleRef.current?.focus();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!panelRef.current?.contains(target) && !toggleRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  if (HIDDEN_ON.has(pathname)) return null;

  return (
    <>
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-labelledby={titleId}
          className={cn(
            "fixed z-50 flex animate-pop-in flex-col overflow-hidden rounded-[22px] border border-gold-500/60 bg-cream-50 text-ink shadow-[0_24px_70px_rgb(0_0_0/0.45)]",
            // Phones: above the pill and the Call/WhatsApp bar, full width with margins.
            "inset-x-3 bottom-[calc(148px+env(safe-area-inset-bottom))] max-h-[calc(100dvh-236px)]",
            // Tablet/desktop: a 400px window anchored above the pill.
            "nav:right-auto nav:bottom-[88px] nav:left-6 nav:w-[400px] nav:max-h-[calc(100dvh-112px)]",
          )}
        >
          <header className="relative flex flex-col gap-1 bg-cocoa-900 px-5 pt-5 pb-4 pr-14 text-cream-50">
            <span className="text-[11px] font-bold tracking-[0.16em] text-gold-300 uppercase">
              Enquiry
            </span>
            <h2 id={titleId} className="m-0 font-serif text-[26px] leading-tight">
              Check your date
            </h2>
            <p className="m-0 text-[13px] leading-relaxed text-sand-200">
              Tell us about your celebration — we&apos;ll call or WhatsApp you shortly.
            </p>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                toggleRef.current?.focus();
              }}
              aria-label="Close enquiry form"
              className="absolute top-3 right-3 flex size-10 cursor-pointer items-center justify-center rounded-full text-sand-200 hover:bg-white/10 hover:text-cream-50"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </header>
          <div className="h-[3px] shrink-0 bg-gold-500" />
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
            <InquiryForm
              key={formKey}
              tone="light"
              variant="full"
              showHeading={false}
              serviceOptions={serviceOptions}
              sourcePage={pathname}
              whatsappHref={whatsappHref}
              submitLabel="Send enquiry"
            />
          </div>
        </div>
      )}

      <button
        ref={toggleRef}
        type="button"
        onClick={() => {
          if (!open) setFormKey((k) => k + 1);
          setOpen(!open);
        }}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="group fixed bottom-[calc(88px+env(safe-area-inset-bottom))] left-[max(12px,env(safe-area-inset-left))] z-50 flex cursor-pointer items-center gap-2.5 rounded-full border border-gold-300/80 bg-[linear-gradient(135deg,var(--color-gold-300),var(--color-gold-500)_45%,var(--color-gold-700))] py-1.5 pr-5 pl-1.5 text-left text-cocoa-950 shadow-[0_14px_34px_rgb(0_0_0/0.35),inset_0_1px_0_rgb(255_255_255/0.5)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgb(200_149_46/0.5),inset_0_1px_0_rgb(255_255_255/0.5)] nav:bottom-6 nav:left-6 nav:pr-6"
      >
        {/* Pulsing gold ring, like the Call / WhatsApp buttons. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 animate-ping-ring rounded-full [--ring-rgb:200_149_46]"
        />
        {/* Light sweep across the gold. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 animate-shine rounded-full bg-[linear-gradient(110deg,transparent_30%,rgb(255_255_255/0.6)_50%,transparent_70%)] bg-[length:250%_100%]"
        />
        <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-cocoa-900 text-gold-300 shadow-[inset_0_0_0_1px_rgb(232_196_104/0.45)] transition-transform duration-300 group-hover:rotate-[-8deg] nav:size-11">
          {open ? (
            <X aria-hidden="true" className="size-5" />
          ) : (
            <CalendarHeart aria-hidden="true" className="size-5" />
          )}
        </span>
        <span className="relative flex flex-col leading-tight">
          <span className="text-[15px] font-extrabold nav:text-base">
            {open ? "Close" : "Enquire now"}
          </span>
          {!open && (
            <span className="text-[11px] font-semibold tracking-[0.04em] text-cocoa-900/75">
              Check your date
            </span>
          )}
        </span>
      </button>
    </>
  );
}
