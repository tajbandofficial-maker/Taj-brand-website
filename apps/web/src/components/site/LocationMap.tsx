import { MapPin } from "lucide-react";

import { buttonClasses } from "@/components/ui/Button";

type Props = { embedUrl: string | null; address: string };

/** The place Google should route to: the embed's search (`?q=`), else the address. */
function destination(embedUrl: string | null, address: string): string {
  if (!embedUrl) return address;
  try {
    return new URL(embedUrl).searchParams.get("q") ?? address;
  } catch {
    return address;
  }
}

/**
 * Google Map of the studio (admin → Site settings → Google Maps embed link) with
 * directions. The iframe is lazy, so Google loads only when the map nears the screen.
 */
export function LocationMap({ embedUrl, address }: Props) {
  const place = encodeURIComponent(destination(embedUrl, address));

  return (
    <div className="overflow-hidden rounded-[18px] border border-line bg-white">
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title={`Google Map: ${address}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="block aspect-[16/7] min-h-[320px] w-full border-0 bg-cream-100"
        />
      ) : (
        <div className="dot-grid flex aspect-[16/7] min-h-[260px] items-center justify-center bg-cocoa-900">
          <MapPin aria-hidden="true" className="size-10 text-gold-300" />
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <p className="m-0 flex max-w-xl items-start gap-2.5 text-[15px] leading-relaxed text-ink">
          <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-gold-700" />
          {address}
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${place}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ variant: "dark" })}
          >
            Get directions
          </a>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${place}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ variant: "gold" })}
          >
            Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}
