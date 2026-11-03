"use client";

import { usePathname } from "next/navigation";

import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useUiStore } from "@/stores/ui-store";

type Props = { telHref: string; whatsapp: string; defaultMessage: string };

/** Pages where the bar is hidden (they already show both CTAs prominently). */
const HIDDEN_ON = new Set(["/contact"]);

/** Fixed Call / WhatsApp bar on < 860px. WhatsApp text follows the current page. */
export function StickyMobileBar({ telHref, whatsapp, defaultMessage }: Props) {
  const pathname = usePathname();
  const pageMessage = useUiStore((s) => s.whatsappMessage);
  if (HIDDEN_ON.has(pathname)) return null;

  return (
    <>
      {/* Spacer so the footer isn't hidden behind the bar. */}
      <div aria-hidden="true" className="h-[76px] bg-cocoa-950 nav:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2.5 border-t border-gold-500/40 bg-cocoa-900 px-3 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] nav:hidden">
        <a
          href={telHref}
          className="flex min-h-12 items-center justify-center rounded-full border-[1.5px] border-gold-500 text-[15px] font-bold text-cream-50"
        >
          Call now
        </a>
        <a
          href={buildWhatsAppUrl(whatsapp, pageMessage ?? defaultMessage)}
          className="flex min-h-12 items-center justify-center rounded-full bg-whatsapp text-[15px] font-bold text-whatsapp-ink"
        >
          WhatsApp
        </a>
      </div>
    </>
  );
}
