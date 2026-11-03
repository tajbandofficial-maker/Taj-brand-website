import type { SiteSettings } from "@taj/types";

import { Logo } from "./Logo";
import { SiteNav } from "./SiteNav";

/** Sticky dark header. Only the nav (active state + mobile toggle) is client-side. */
export function SiteHeader({ settings }: { settings: SiteSettings }) {
  return (
    <header className="sticky top-0 z-20 border-b border-gold-500/35 bg-cocoa-900">
      <SiteNav logo={<Logo businessName={settings.businessName} tagline={settings.tagline} />} />
    </header>
  );
}
