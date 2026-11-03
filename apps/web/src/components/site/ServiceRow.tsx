import type { ServiceCard } from "@taj/types";
import Link from "next/link";

import { ImageFrame } from "@/components/ui/ImageFrame";
import { serviceHref } from "@/lib/navigation";

/** Wide image + text row used on the /services index. */
export function ServiceRow({
  service,
  priority = false,
}: {
  service: ServiceCard;
  priority?: boolean;
}) {
  return (
    <Link
      href={serviceHref(service.slug)}
      className="group flex flex-wrap overflow-hidden rounded-[20px] border border-line bg-white text-ink transition-colors hover:border-gold-500 hover:text-ink"
    >
      <ImageFrame
        image={service.image}
        sizes="(min-width: 860px) 560px, 100vw"
        priority={priority}
        className="min-h-[240px] flex-[1_1_320px]"
        imageClassName="transition-transform duration-700 group-hover:scale-105"
      />
      <div className="flex flex-[1_1_360px] flex-col justify-center gap-3 p-[clamp(22px,4vw,40px)]">
        <h2 className="m-0 text-[clamp(26px,3.5vw,36px)] text-cocoa-900">{service.title}</h2>
        <p className="m-0 text-base leading-relaxed text-ink-muted">{service.shortDescription}</p>
        <span className="mt-1 text-[15px] font-bold text-gold-700">Explore {service.title} →</span>
      </div>
    </Link>
  );
}
