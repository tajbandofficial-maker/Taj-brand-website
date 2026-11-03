import type { Metadata } from "next";

import { FloatingContact } from "@/components/site/FloatingContact";
import { FloatingEnquiry } from "@/components/site/FloatingEnquiry";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { StickyMobileBar } from "@/components/site/StickyMobileBar";
import { getServices, getSiteSettings } from "@/lib/api/public";
import { siteKeywords } from "@/lib/page-metadata";
import { buildTelUrl, buildWhatsAppUrl } from "@/lib/whatsapp";

/**
 * Render public pages on request — never at build time, when the API isn't
 * reachable (§4.1). Fetches still hit Next's tagged Data Cache, and
 * Cloudflare caches the HTML at the edge, so the API is rarely called.
 */
export const revalidate = 0;

/** Site-wide SEO from admin → Site settings → Google & sharing; pages override parts. */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const image = settings.ogImage;
  return {
    // Short brand suffix keeps page titles within Google's ~65 characters.
    title: { default: settings.seoSiteTitle, template: `%s | ${settings.businessName}` },
    description: settings.seoDescription ?? undefined,
    keywords: siteKeywords(settings),
    authors: [{ name: settings.businessName }],
    creator: settings.businessName,
    publisher: settings.businessName,
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: settings.businessName,
      locale: "en_IN",
      images: image ? [{ url: image.url, alt: image.alt }] : undefined,
    },
  };
}

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [settings, services] = await Promise.all([getSiteSettings(), getServices()]);

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-gold-500 px-5 py-3 font-bold text-cocoa-900 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SiteHeader settings={settings} />
      <main id="main">{children}</main>
      <SiteFooter settings={settings} services={services} />
      <FloatingEnquiry
        serviceOptions={services.map((s) => ({ value: s.slug, label: s.title }))}
        whatsappHref={buildWhatsAppUrl(settings.whatsapp, settings.whatsappDefaultMessage)}
      />
      <FloatingContact
        phone={settings.phone}
        whatsapp={settings.whatsapp}
        defaultMessage={settings.whatsappDefaultMessage}
      />
      <StickyMobileBar
        telHref={buildTelUrl(settings.phone)}
        whatsapp={settings.whatsapp}
        defaultMessage={settings.whatsappDefaultMessage}
      />
    </>
  );
}
