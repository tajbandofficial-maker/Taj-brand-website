import { z } from "zod";

import { imageAssetSchema } from "./content.js";

export const openingHoursSchema = z.object({
  days: z.array(z.string()),
  opens: z.string().regex(/^\d{2}:\d{2}$/),
  closes: z.string().regex(/^\d{2}:\d{2}$/),
});
export type OpeningHours = z.infer<typeof openingHoursSchema>;

export const socialsSchema = z.object({
  instagram: z.url().optional(),
  facebook: z.url().optional(),
  youtube: z.url().optional(),
});
export type Socials = z.infer<typeof socialsSchema>;

/** Public shape of the SiteSettings singleton (mirrors the Prisma model). */
export const siteSettingsSchema = z.object({
  businessName: z.string(),
  tagline: z.string(),
  phone: z.string(),
  /** Second number shown beside the main phone. */
  altPhone: z.string().nullable(),
  /** E.164 without "+", e.g. 91XXXXXXXXXX */
  whatsapp: z.string(),
  email: z.string().nullable(),
  addressLine: z.string(),
  city: z.string(),
  postalCode: z.string().nullable(),
  geoLat: z.number().nullable(),
  geoLng: z.number().nullable(),
  hours: z.array(openingHoursSchema),
  mapEmbedUrl: z.string().nullable(),
  googleRating: z.number().nullable(),
  googleReviewCount: z.number().int().nullable(),
  googleProfileUrl: z.string().nullable(),
  foundedYear: z.number().int().nullable(),
  weddingsPerformed: z.number().int().nullable(),
  netflixUrl: z.string().nullable(),
  socials: socialsSchema,
  serviceAreas: z.array(z.string()),
  whatsappDefaultMessage: z.string(),
  /** Words in the home page gold ticker. */
  ticker: z.array(z.string()),
  netflixBlurb: z.string().nullable(),
  /** Home page title, and the suffix of every other page title. */
  seoSiteTitle: z.string(),
  /** Fallback search description. */
  seoDescription: z.string().nullable(),
  /** Fallback social share image. */
  ogImage: imageAssetSchema.nullable(),
  updatedAt: z.iso.datetime(),
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
