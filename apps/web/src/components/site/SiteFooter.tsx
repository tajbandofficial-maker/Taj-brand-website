import type { ServiceCard, SiteSettings } from "@taj/types";
import Image from "next/image";
import Link from "next/link";

import { formatAddress, formatHours } from "@/lib/format";
import { FEATURED_SERVICES, footerExplore, serviceHref } from "@/lib/navigation";
import { buildTelUrl } from "@/lib/whatsapp";

import logo from "../../../public/taj-band-logo.png";

type Props = { settings: SiteSettings; services: ServiceCard[] };

const headingClass = "m-0 text-xs font-bold tracking-[0.14em] text-gold-300 uppercase";
const linkClass = "text-sand-200 hover:text-gold-300";

export function SiteFooter({ settings, services }: Props) {
  const { instagram, facebook, youtube } = settings.socials;
  const socials = Object.entries({
    Instagram: instagram,
    Facebook: facebook,
    YouTube: youtube,
  }).flatMap(([label, href]) => (href ? [[label, href] as const] : []));

  return (
    <footer className="bg-cocoa-950 text-sand-200">
      <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-8 px-[clamp(16px,4vw,32px)] pt-12 pb-7">
        <div className="flex flex-col gap-3">
          <Image
            src={logo}
            alt={settings.businessName}
            width={72}
            height={72}
            className="size-[72px] object-contain"
          />
          <p className="m-0 text-sm leading-relaxed">
            Brass band, dhol, DJ on wheels, lights &amp; vintage cars for baraats across Delhi-NCR.
          </p>
        </div>

        <nav aria-label="Services" className="flex flex-col gap-2.5 text-sm">
          <h2 className={headingClass}>Services</h2>
          {services.slice(0, FEATURED_SERVICES).map((s) => (
            <Link key={s.slug} href={serviceHref(s.slug)} className={linkClass}>
              {s.title}
            </Link>
          ))}
          {services.length > FEATURED_SERVICES && (
            <Link href="/services" className="font-semibold text-gold-300 hover:text-gold-500">
              All {services.length} services →
            </Link>
          )}
        </nav>

        <nav aria-label="Explore" className="flex flex-col gap-2.5 text-sm">
          <h2 className={headingClass}>Explore</h2>
          {footerExplore.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-2.5 text-sm">
          <h2 className={headingClass}>Visit</h2>
          <address className="leading-relaxed not-italic">{formatAddress(settings)}</address>
          <a href={buildTelUrl(settings.phone)} className={linkClass}>
            {settings.phone}
          </a>
          {settings.altPhone && (
            <a href={buildTelUrl(settings.altPhone)} className={linkClass}>
              {settings.altPhone}
            </a>
          )}
          {settings.email && (
            <a href={`mailto:${settings.email}`} className={`${linkClass} break-all`}>
              {settings.email}
            </a>
          )}
          {settings.hours.map((h) => (
            <span key={h.days.join()}>{formatHours(h)}</span>
          ))}
          {socials.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-2">
              {socials.map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noopener" className={linkClass}>
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] border-t border-sand-200/12 px-[clamp(16px,4vw,32px)] py-[18px] text-[12.5px] text-sand-400">
        © {new Date().getFullYear()} {settings.businessName} · {settings.tagline}
      </div>
    </footer>
  );
}
