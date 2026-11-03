import "server-only";

import {
  type AddOn,
  type GalleryImage,
  type GalleryVideo,
  type Package,
  type PackageComparisonRow,
  type PageKey,
  type PublicPage,
  resolvePageText,
  type Review,
  type ServiceCard,
  type ServiceDetail,
  type SiteSettings,
} from "@taj/types";

import { ApiError, apiFetch } from "./internal";

/**
 * Tagged, cached fetchers for public pages (ARCHITECTURE.md §4.2, §6.5).
 * Data stays in Next's Data Cache until NestJS revalidates a tag after an
 * admin edit (or 24 h as a safety net). Every fetch also carries the
 * umbrella "public" tag so a settings change can refresh everything.
 */
const ONE_DAY = 86_400;
const cached = (...tags: string[]) => ({
  cache: "force-cache" as const,
  next: { tags: ["public", ...tags], revalidate: ONE_DAY },
});

export function getSiteSettings(): Promise<SiteSettings> {
  return apiFetch("/public/settings", cached("settings"));
}

/** A fixed page's content, with `text` = saved copy merged over the defaults. */
export async function getPage<K extends PageKey>(key: K) {
  const page = await apiFetch<PublicPage>(`/public/pages/${key}`, cached(`page:${key}`));
  return { ...page, text: resolvePageText(key, page.fields) };
}

export function getServices(): Promise<ServiceCard[]> {
  return apiFetch("/public/services", cached("services"));
}

/** Returns null for unknown or unpublished slugs (the page then 404s). */
export async function getService(slug: string): Promise<ServiceDetail | null> {
  try {
    return await apiFetch(
      `/public/services/${encodeURIComponent(slug)}`,
      cached("services", `service:${slug}`, "gallery", "faqs"),
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export function getPackages(): Promise<Package[]> {
  return apiFetch("/public/packages", cached("packages"));
}

export function getPackageComparison(): Promise<PackageComparisonRow[]> {
  return apiFetch("/public/packages/comparison", cached("packages"));
}

export function getAddOns(): Promise<AddOn[]> {
  return apiFetch("/public/addons", cached("packages", "services"));
}

export function getGallery(): Promise<GalleryImage[]> {
  return apiFetch("/public/gallery", cached("gallery"));
}

export function getVideos(): Promise<GalleryVideo[]> {
  return apiFetch("/public/videos", cached("gallery"));
}

export function getReviews(opts?: { featured?: boolean }): Promise<Review[]> {
  return apiFetch(`/public/reviews${opts?.featured ? "?featured=true" : ""}`, cached("reviews"));
}

export function getHighProfileReviews(): Promise<Review[]> {
  return apiFetch("/public/reviews?source=HIGH_PROFILE", cached("reviews"));
}

export function getSitemapData(): Promise<{
  services: { slug: string; updatedAt: string }[];
  siteUpdatedAt: string;
}> {
  return apiFetch("/public/sitemap", cached("services", "settings"));
}
