import type { GalleryCategory } from "@taj/types";

/** Display label + URL slug (?category=) for each gallery category, in tab order. */
export const galleryCategoryMeta: Record<GalleryCategory, { label: string; slug: string }> = {
  BARAAT: { label: "Baraat", slug: "baraat" },
  BAND: { label: "Band", slug: "band" },
  DHOL: { label: "Dhol", slug: "dhol" },
  SHEHNAI: { label: "Shehnai", slug: "shehnai" },
  CARS_CHATTAR: { label: "Cars", slug: "cars" },
  LIGHTING: { label: "Lighting", slug: "lighting" },
};

export function categoryFromSlug(slug: string | null): GalleryCategory | null {
  if (!slug) return null;
  const hit = Object.entries(galleryCategoryMeta).find(([, m]) => m.slug === slug);
  return (hit?.[0] as GalleryCategory | undefined) ?? null;
}

/** Bento rhythm from the design: [colSpan, rowSpan], repeated. */
export const bentoPattern: [1 | 2, 1 | 2][] = [
  [2, 2],
  [1, 1],
  [1, 2],
  [1, 1],
  [2, 1],
  [1, 1],
  [1, 2],
  [2, 2],
  [1, 1],
  [1, 1],
  [2, 1],
  [1, 1],
];
