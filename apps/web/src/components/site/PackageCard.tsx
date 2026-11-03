import type { Package } from "@taj/types";

import { ButtonLink } from "@/components/ui/Button";
import { CheckList } from "@/components/ui/CheckList";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/cn";
import { formatStartingPrice } from "@/lib/format";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type Props = {
  pkg: Package;
  whatsapp: string;
  /** "teaser" (home) hides the price block; "full" (/packages) shows it. */
  variant?: "teaser" | "full";
  as?: "h2" | "h3";
  className?: string;
};

/** Package card on dark backgrounds; the CTA opens WhatsApp pre-filled with the package name. */
export function PackageCard({
  pkg,
  whatsapp,
  variant = "full",
  as: Title = "h3",
  className,
}: Props) {
  const href = buildWhatsAppUrl(
    whatsapp,
    `Hi Taj Band, please share the price of the ${pkg.name} package. My date is:`,
  );

  return (
    <article
      className={cn(
        "flex flex-col gap-[18px] rounded-[18px] border p-[26px] text-cream-50",
        pkg.highlighted ? "border-gold-500 bg-gold-500/14" : "border-sand-200/18 bg-white/[0.04]",
        variant === "full" && "p-7",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2.5">
        <Title className="m-0 text-[28px] leading-tight">{pkg.name}</Title>
        {pkg.highlighted && <Pill variant="highlight">Most booked</Pill>}
      </div>

      {variant === "full" ? (
        <div className="flex flex-col gap-0.5">
          {pkg.startingPrice !== null && (
            <span className="text-[13px] text-sand-400">Starting from</span>
          )}
          <span className="font-serif text-[34px] leading-tight text-gold-300">
            {formatStartingPrice(pkg.startingPrice)}
          </span>
          {pkg.tagline && <span className="text-sm text-sand-200">{pkg.tagline}</span>}
          {pkg.priceNote && <span className="text-[13px] text-sand-400">{pkg.priceNote}</span>}
        </div>
      ) : (
        pkg.tagline && <span className="text-sm text-sand-200">{pkg.tagline}</span>
      )}

      <CheckList
        items={pkg.inclusions}
        className={cn("flex-1", variant === "full" && "border-t border-sand-200/15 pt-[18px]")}
      />

      <ButtonLink
        href={href}
        variant={pkg.highlighted ? "gold" : "outlineGold"}
        fullWidth
        className={cn(!pkg.highlighted && "font-bold")}
      >
        {variant === "full" ? `Enquire about ${pkg.name}` : "Get price on WhatsApp"}
      </ButtonLink>
    </article>
  );
}
