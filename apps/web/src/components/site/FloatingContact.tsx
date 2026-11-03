"use client";

import { Phone } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { buildTelUrl, buildWhatsAppUrl } from "@/lib/whatsapp";
import { useUiStore } from "@/stores/ui-store";

import { WhatsAppIcon } from "./WhatsAppIcon";

type Props = { phone: string; whatsapp: string; defaultMessage: string };

/** Round icon button with a label that slides out on hover / keyboard focus. */
function FloatingButton({
  href,
  label,
  hint,
  external,
  className,
  children,
}: {
  href: string;
  label: string;
  hint: string;
  external?: boolean;
  className: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex items-center justify-end gap-3"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none translate-x-2 rounded-full bg-cream-50 px-4 py-2 text-sm font-bold whitespace-nowrap text-cocoa-900 opacity-0 shadow-[0_10px_30px_rgb(0_0_0/0.25)] transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
      >
        {hint}
      </span>
      <span
        className={cn(
          "flex items-center justify-center rounded-full shadow-[0_12px_30px_rgb(0_0_0/0.3)] transition-transform duration-200 group-hover:scale-110",
          className,
        )}
      >
        {children}
      </span>
    </a>
  );
}

/**
 * Call + WhatsApp buttons fixed bottom-right on ≥ 860px. Phones get the same
 * links in StickyMobileBar instead. The WhatsApp message follows the current page.
 */
export function FloatingContact({ phone, whatsapp, defaultMessage }: Props) {
  const pageMessage = useUiStore((s) => s.whatsappMessage);

  return (
    <div className="fixed right-[max(24px,env(safe-area-inset-right))] bottom-[max(24px,env(safe-area-inset-bottom))] z-40 hidden flex-col items-end gap-3.5 nav:flex">
      <FloatingButton
        href={buildTelUrl(phone)}
        label={`Call us on ${phone}`}
        hint={`Call ${phone}`}
        className="size-[52px] animate-ping-ring bg-call text-white [--ring-rgb:26_115_232]"
      >
        <Phone aria-hidden="true" className="size-6" strokeWidth={2.25} />
      </FloatingButton>
      <FloatingButton
        href={buildWhatsAppUrl(whatsapp, pageMessage ?? defaultMessage)}
        label="Chat with us on WhatsApp"
        hint="Chat with us"
        external
        className="size-[60px] animate-ping-ring bg-whatsapp text-white"
      >
        <WhatsAppIcon className="size-8" />
      </FloatingButton>
    </div>
  );
}
