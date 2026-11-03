import {
  type AddOn,
  type Faq,
  type GalleryImage,
  type GalleryVideo,
  type ImageAsset,
  type OpeningHours,
  type Package,
  type PageKey,
  type PublicPage,
  resolvePageText,
  type Review,
  type ServiceCard,
  type ServiceDetail,
  type SiteSettings,
  type Socials,
} from "@taj/types";

import type { Prisma } from "../../generated/prisma/client.js";
import { toStringList } from "../../prisma/json.js";

/** Converts DB rows to the public response shapes in @taj/types. */

type MediaRow = Prisma.MediaModel;

export const toImage = (m: MediaRow | null | undefined): ImageAsset | null =>
  m ? { url: m.url, alt: m.alt, width: m.width, height: m.height } : null;

export function toSettings(
  s: Prisma.SiteSettingsModel & { ogImage: MediaRow | null },
): SiteSettings {
  return {
    businessName: s.businessName,
    tagline: s.tagline,
    phone: s.phone,
    altPhone: s.altPhone,
    whatsapp: s.whatsapp,
    email: s.email,
    addressLine: s.addressLine,
    city: s.city,
    postalCode: s.postalCode,
    geoLat: s.geoLat,
    geoLng: s.geoLng,
    hours: (s.hours ?? []) as OpeningHours[],
    mapEmbedUrl: s.mapEmbedUrl,
    googleRating: s.googleRating,
    googleReviewCount: s.googleReviewCount,
    googleProfileUrl: s.googleProfileUrl,
    foundedYear: s.foundedYear,
    weddingsPerformed: s.weddingsPerformed,
    netflixUrl: s.netflixUrl,
    socials: (s.socials ?? {}) as Socials,
    serviceAreas: toStringList(s.serviceAreas),
    whatsappDefaultMessage: s.whatsappDefaultMessage,
    ticker: toStringList(s.ticker),
    netflixBlurb: s.netflixBlurb,
    seoSiteTitle: s.seoSiteTitle,
    seoDescription: s.seoDescription,
    ogImage: toImage(s.ogImage),
    updatedAt: s.updatedAt.toISOString(),
  };
}

type ServiceRow = Prisma.ServiceModel & { heroImage: MediaRow | null };

export const toServiceCard = (s: ServiceRow): ServiceCard => ({
  slug: s.slug,
  title: s.title,
  shortDescription: s.shortDescription,
  image: toImage(s.heroImage),
  order: s.order,
});

export const toFaq = (f: Prisma.FaqModel): Faq => ({
  id: f.id,
  question: f.question,
  answer: f.answer,
});

export function toServiceDetail(
  s: ServiceRow & {
    ogImage: MediaRow | null;
    faqs: Prisma.FaqModel[];
    galleryItems: (Prisma.GalleryItemModel & { media: MediaRow | null })[];
  },
): ServiceDetail {
  return {
    slug: s.slug,
    title: s.title,
    h1: s.h1,
    shortDescription: s.shortDescription,
    intro: s.intro,
    sections: (s.sections ?? []) as ServiceDetail["sections"],
    inclusions: toStringList(s.inclusions),
    areaCopy: s.areaCopy,
    heroImage: toImage(s.heroImage),
    gallery: s.galleryItems.map((g) => toImage(g.media)).filter((i): i is ImageAsset => i !== null),
    faqs: s.faqs.map(toFaq),
    seoTitle: s.seoTitle,
    seoDescription: s.seoDescription,
    ogImage: toImage(s.ogImage),
  };
}

export const toPackage = (p: Prisma.PackageModel): Package => ({
  slug: p.slug,
  name: p.name,
  tagline: p.tagline,
  startingPrice: p.startingPrice,
  priceNote: p.priceNote,
  inclusions: toStringList(p.inclusions),
  highlighted: p.highlighted,
});

export const toAddOn = (
  a: Prisma.AddOnModel & { service: { slug: string; published: boolean } | null },
): AddOn => ({
  id: a.id,
  name: a.name,
  description: a.description,
  startingPrice: a.startingPrice,
  // Only link to service pages that are actually live.
  serviceSlug: a.service?.published ? a.service.slug : null,
});

type GalleryRow = Prisma.GalleryItemModel & { media: MediaRow | null };

export const toGalleryImage = (g: GalleryRow & { media: MediaRow }): GalleryImage => ({
  id: g.id,
  category: g.category as GalleryImage["category"],
  image: toImage(g.media)!,
  caption: g.caption,
});

export const toGalleryVideo = (
  g: Pick<GalleryRow, "id" | "caption" | "media"> & { youtubeId: string },
): GalleryVideo => ({
  id: g.id,
  title: g.caption ?? "Taj Band video",
  youtubeId: g.youtubeId,
  // Fall back to YouTube's own thumbnail when no poster was uploaded.
  poster: toImage(g.media) ?? {
    url: `https://i.ytimg.com/vi/${g.youtubeId}/hqdefault.jpg`,
    alt: g.caption ?? "Video thumbnail",
    width: 480,
    height: 360,
  },
});

export const toReview = (r: Prisma.ReviewModel & { image: MediaRow | null }): Review => ({
  id: r.id,
  author: r.author,
  rating: r.rating,
  text: r.text,
  meta: r.meta,
  source: r.source,
  image: toImage(r.image),
});

type PageRow = Prisma.PageContentModel & { heroImage: MediaRow | null; ogImage: MediaRow | null };

export function toPage(key: PageKey, p: PageRow | null): PublicPage {
  const fields = (p?.fields ?? {}) as Record<string, string>;
  const caption: string =
    (resolvePageText(key, fields) as Record<string, string>).videoCaption ?? "Taj Band video";
  return {
    key,
    fields,
    heroImage: toImage(p?.heroImage),
    video: p?.youtubeId
      ? toGalleryVideo({ id: `page-${key}`, caption, youtubeId: p.youtubeId, media: null })
      : null,
    seoTitle: p?.seoTitle ?? null,
    seoDescription: p?.seoDescription ?? null,
    ogImage: toImage(p?.ogImage),
  };
}
