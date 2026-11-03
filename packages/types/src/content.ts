import { z } from "zod";

/** A resolved media record (R2 public URL + intrinsic size + required alt text). */
export const imageAssetSchema = z.object({
  url: z.string(),
  alt: z.string(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
});
export type ImageAsset = z.infer<typeof imageAssetSchema>;

export const faqSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
});
export type Faq = z.infer<typeof faqSchema>;

/** Full service page payload (GET /public/services/:slug). */
export const serviceDetailSchema = z.object({
  slug: z.string(),
  title: z.string(),
  h1: z.string(),
  shortDescription: z.string(),
  intro: z.string(),
  sections: z.array(z.object({ heading: z.string(), body: z.string() })),
  inclusions: z.array(z.string()),
  areaCopy: z.string().nullable(),
  heroImage: imageAssetSchema.nullable(),
  gallery: z.array(imageAssetSchema),
  faqs: z.array(faqSchema),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  ogImage: imageAssetSchema.nullable(),
});
export type ServiceDetail = z.infer<typeof serviceDetailSchema>;

export const packageSchema = z.object({
  slug: z.string(),
  name: z.string(),
  tagline: z.string().nullable(),
  /** INR; null → "Price on request". */
  startingPrice: z.number().int().nullable(),
  priceNote: z.string().nullable(),
  inclusions: z.array(z.string()),
  highlighted: z.boolean(),
});
export type Package = z.infer<typeof packageSchema>;

export const addOnSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  startingPrice: z.number().int().nullable(),
  /** Optional service page the add-on links to. */
  serviceSlug: z.string().nullable(),
});
export type AddOn = z.infer<typeof addOnSchema>;

/** One row of the package comparison table; `values` follows package order. */
export const packageComparisonRowSchema = z.object({
  label: z.string(),
  values: z.array(z.string()),
});
export type PackageComparisonRow = z.infer<typeof packageComparisonRowSchema>;

export const galleryCategories = [
  "BARAAT",
  "BAND",
  "DHOL",
  "SHEHNAI",
  "CARS_CHATTAR",
  "LIGHTING",
] as const;
export const galleryCategorySchema = z.enum(galleryCategories);
export type GalleryCategory = z.infer<typeof galleryCategorySchema>;

export const galleryImageSchema = z.object({
  id: z.string(),
  category: galleryCategorySchema,
  image: imageAssetSchema,
  caption: z.string().nullable(),
});
export type GalleryImage = z.infer<typeof galleryImageSchema>;

export const galleryVideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  /** null until the client adds the YouTube link — the card then renders as a still. */
  youtubeId: z.string().nullable(),
  poster: imageAssetSchema,
});
export type GalleryVideo = z.infer<typeof galleryVideoSchema>;

export const reviewSourceSchema = z.enum(["GOOGLE", "DIRECT", "HIGH_PROFILE"]);
export type ReviewSource = z.infer<typeof reviewSourceSchema>;

export const reviewSchema = z.object({
  id: z.string(),
  author: z.string(),
  rating: z.number().int().min(1).max(5),
  text: z.string(),
  /** e.g. "Royal package · Gurugram" */
  meta: z.string().nullable(),
  source: reviewSourceSchema,
  image: imageAssetSchema.nullable(),
});
export type Review = z.infer<typeof reviewSchema>;
