import type { ServiceCard, SiteSettings } from "@taj/types";

import { Logo } from "./Logo";
import { SiteNav } from "./SiteNav";

/** Sticky dark header. Only the nav (active state + mobile toggle) is client-side. */
export function SiteHeader({
  settings,
  services,
}: {
  settings: SiteSettings;
  services: ServiceCard[];
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-gold-500/35 bg-cocoa-900">
      <SiteNav
        services={services.map(({ slug, title, shortDescription, image }) => ({
          slug,
          title,
          shortDescription,
          image,
        }))}
        logo={<Logo businessName={settings.businessName} tagline={settings.tagline} />}
      />
    </header>
  );
}
