import "server-only";

import { type ImageAsset, pageDefs, type PageKey, type SiteSettings } from "@taj/types";
import type { Metadata } from "next";

import { getPage, getSiteSettings } from "@/lib/api/public";

type SeoInput = {
  /** null = the site title. */
  title: string | null;
  /** Show the title as-is, without the " | <site title>" suffix (home page). */
  absoluteTitle?: boolean;
  description: string | null;
  path: string;
  /** Page-specific share image; falls back to the site default. */
  image: ImageAsset | null;
  /** Extra search keywords for this page, ahead of the site-wide ones. */
  keywords?: string[];
};

/** Site-wide keywords: the brand plus "wedding band / baraat band <city>" for each area served. */
export function siteKeywords(settings: SiteSettings): string[] {
  return [
    settings.businessName,
    ...settings.serviceAreas.flatMap((city) => [`wedding band ${city}`, `baraat band ${city}`]),
  ];
}

/**
 * Search + share tags for one page. Every value is admin-managed: the page's
 * own SEO fields first, then Site settings → Google & sharing.
 */
export function buildMetadata(settings: SiteSettings, seo: SeoInput): Metadata {
  const title = seo.title ?? settings.seoSiteTitle;
  const description = seo.description ?? settings.seoDescription ?? undefined;
  const image = seo.image ?? settings.ogImage;
  return {
    // Other pages get "<title> | <business name>" from the site layout's template.
    title: seo.absoluteTitle || !seo.title ? { absolute: title } : title,
    description,
    keywords: [...new Set([...(seo.keywords ?? []), ...siteKeywords(settings)])],
    alternates: { canonical: seo.path },
    // Child openGraph replaces the layout's, so repeat the shared parts here.
    openGraph: {
      type: "website",
      siteName: settings.businessName,
      locale: "en_IN",
      url: seo.path,
      title,
      description,
      images: image
        ? [
            {
              url: image.url,
              alt: image.alt,
              width: image.width ?? undefined,
              height: image.height ?? undefined,
            },
          ]
        : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description },
  };
}

/** A fixed page (admin → Pages → Google & sharing). */
export async function pageMetadata(key: PageKey): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage(key), getSiteSettings()]);
  const { path, seo } = pageDefs[key];
  return buildMetadata(settings, {
    // Home's default title is the site title itself.
    title: page.seoTitle ?? (key === "home" ? null : seo.title),
    absoluteTitle: key === "home",
    description: page.seoDescription ?? seo.description,
    path,
    image: page.ogImage ?? page.heroImage,
  });
}
