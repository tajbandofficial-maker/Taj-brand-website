import type { ServiceCard as ServiceCardData } from "@taj/types";
import Link from "next/link";

import { ImageFrame } from "@/components/ui/ImageFrame";
import { serviceHref } from "@/lib/navigation";

/** Photo card used in the home "Our services" grid. */
export function ServiceCard({ service }: { service: ServiceCardData }) {
  return (
    <Link
      href={serviceHref(service.slug)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white text-ink transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-gold-500 hover:text-ink"
    >
      <ImageFrame
        image={service.image}
        sizes="(min-width: 1200px) 230px, (min-width: 700px) 33vw, 100vw"
        className="aspect-[4/3]"
        imageClassName="transition-transform duration-500 group-hover:scale-105"
      />
      <div className="flex flex-col gap-1.5 px-[18px] pt-4 pb-[18px]">
        <h3 className="m-0 text-[22px] text-cocoa-900">{service.title}</h3>
        <p className="m-0 text-sm leading-normal text-ink-muted">{service.shortDescription}</p>
        <span className="mt-1.5 text-sm font-semibold text-gold-700">View service →</span>
      </div>
    </Link>
  );
}
