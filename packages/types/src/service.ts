import { z } from "zod";

import { imageAssetSchema } from "./content.js";

/** Card fields returned by GET /public/services. */
export const serviceCardSchema = z.object({
  slug: z.string(),
  title: z.string(),
  shortDescription: z.string(),
  image: imageAssetSchema.nullable(),
  order: z.number().int(),
});
export type ServiceCard = z.infer<typeof serviceCardSchema>;
