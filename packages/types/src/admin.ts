/**
 * Shapes returned by the admin API (`/admin/*`), as JSON (dates are ISO strings).
 * Type-only: nothing here ships to the browser at runtime.
 */

import type { PageKey } from "./pages.js";

export type AdminMe = { id: string; email: string; name: string; lastLoginAt: string | null };

export type AdminMedia = {
  id: string;
  key: string;
  url: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  alt: string;
  createdAt: string;
  _count?: {
    serviceHeroes: number;
    galleryItems: number;
    reviewImages: number;
    homeHeroes: number;
  };
};

type Timestamps = { createdAt: string; updatedAt: string };
type Ordered = { order: number; published: boolean };
type Ref = { id: string; slug: string; title: string };

export type AdminService = Timestamps &
  Ordered & {
    id: string;
    slug: string;
    title: string;
    h1: string;
    shortDescription: string;
    intro: string;
    sections: { heading: string; body: string }[];
    inclusions: string[];
    areaCopy: string | null;
    heroImageId: string | null;
    heroImage: AdminMedia | null;
    seoTitle: string | null;
    seoDescription: string | null;
    ogImageId: string | null;
    ogImage: AdminMedia | null;
    relatedPackages: { id: string; name: string }[];
    _count: { faqs: number; galleryItems: number };
  };

export type AdminPackage = Timestamps &
  Ordered & {
    id: string;
    slug: string;
    name: string;
    tagline: string | null;
    startingPrice: number | null;
    priceNote: string | null;
    inclusions: string[];
    highlighted: boolean;
    services: { id: string; title: string }[];
  };

export type AdminAddOn = Timestamps &
  Ordered & {
    id: string;
    name: string;
    description: string | null;
    startingPrice: number | null;
    serviceId: string | null;
    service: Ref | null;
  };

export type AdminComparisonRow = Timestamps & {
  id: string;
  label: string;
  values: string[];
  order: number;
};

export type AdminGalleryCategory =
  "BARAAT" | "BAND" | "DHOL" | "SHEHNAI" | "CARS_CHATTAR" | "LIGHTING" | "VIDEO";

export type AdminGalleryItem = Timestamps &
  Ordered & {
    id: string;
    type: "IMAGE" | "VIDEO";
    category: AdminGalleryCategory;
    mediaId: string | null;
    media: AdminMedia | null;
    youtubeId: string | null;
    caption: string | null;
    serviceId: string | null;
    service: Ref | null;
  };

export type AdminReviewSource = "GOOGLE" | "DIRECT" | "HIGH_PROFILE";

export type AdminReview = Timestamps &
  Ordered & {
    id: string;
    author: string;
    rating: number;
    text: string;
    meta: string | null;
    source: AdminReviewSource;
    imageId: string | null;
    image: AdminMedia | null;
    eventDate: string | null;
    featured: boolean;
  };

export type AdminFaq = Timestamps &
  Ordered & {
    id: string;
    question: string;
    answer: string;
    serviceId: string | null;
    service: Ref | null;
  };

export type InquiryStatus = "NEW" | "CONTACTED" | "BOOKED" | "LOST" | "SPAM";

export type AdminInquiry = Timestamps & {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  weddingDate: string | null;
  venue: string | null;
  services: string[];
  message: string | null;
  sourcePage: string | null;
  ip: string | null;
  status: InquiryStatus;
  notes: string | null;
};

export type AdminInquiryPage = {
  items: AdminInquiry[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminStats = {
  byStatus: Record<InquiryStatus, number>;
  last7Days: number;
  last30Days: number;
  recent: AdminInquiry[];
};

export type AdminSettings = {
  id: number;
  businessName: string;
  tagline: string;
  phone: string;
  altPhone: string | null;
  whatsapp: string;
  email: string | null;
  addressLine: string;
  city: string;
  postalCode: string | null;
  geoLat: number | null;
  geoLng: number | null;
  hours: { days: string[]; opens: string; closes: string }[];
  mapEmbedUrl: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  googleProfileUrl: string | null;
  foundedYear: number | null;
  weddingsPerformed: number | null;
  netflixUrl: string | null;
  netflixBlurb: string | null;
  seoSiteTitle: string;
  seoDescription: string | null;
  ogImageId: string | null;
  ogImage: AdminMedia | null;
  socials: { instagram?: string; facebook?: string; youtube?: string };
  serviceAreas: string[];
  ticker: string[];
  whatsappDefaultMessage: string;
  updatedAt: string;
};

/** A fixed page's editable content; `id` is the page key. */
export type AdminPage = {
  id: PageKey;
  key: PageKey;
  label: string;
  path: string;
  /** Only saved values; blanks fall back to the field's default. */
  fields: Record<string, string>;
  heroImageId: string | null;
  heroImage: AdminMedia | null;
  youtubeId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageId: string | null;
  ogImage: AdminMedia | null;
  /** null until the page is first saved. */
  updatedAt: string | null;
};

export type PresignResponse = { uploadUrl: string; key: string; publicUrl: string };

/** Error body returned by every API error (§7.5). */
export type ApiErrorBody = { statusCode: number; message: string | string[]; error: string };
