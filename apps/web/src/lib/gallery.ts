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

/** A tile's size in grid cells: columns (4 = full width) × rows. */
export type BentoTile = { cols: 1 | 2 | 4; rows: 1 | 2 };

const t = (cols: BentoTile["cols"], rows: BentoTile["rows"]): BentoTile => ({ cols, rows });

/**
 * Blocks that each fill complete rows — 4 columns × 2 rows on desktop, 2 columns on phones —
 * so stacking them never leaves a hole. Every block size from 1 to 6 exists, so any photo
 * count (or filter) finishes flush.
 */
const blocks: Record<number, BentoTile[][]> = {
  1: [[t(4, 2)]],
  2: [[t(2, 2), t(2, 2)]],
  3: [[t(1, 2), t(1, 2), t(2, 2)]],
  4: [[t(1, 2), t(1, 2), t(1, 2), t(1, 2)]],
  5: [
    [t(2, 2), t(1, 1), t(1, 1), t(1, 1), t(1, 1)],
    [t(1, 1), t(1, 1), t(2, 2), t(1, 1), t(1, 1)],
  ],
  6: [[t(2, 1), t(1, 1), t(1, 1), t(1, 1), t(1, 1), t(2, 1)]],
};

/** Block sizes in display order: big-left, portraits, big-right, wide, portraits + big. */
const rhythm: [size: number, variant: number][] = [
  [5, 0],
  [4, 0],
  [5, 1],
  [6, 0],
  [3, 0],
];

/** Tile sizes for `count` photos, in order. The grid ends flush whatever the count. */
export function bentoLayout(count: number): BentoTile[] {
  const tiles: BentoTile[] = [];
  let left = count;
  for (let k = 0; left > 0; k++) {
    const [size, variant] = rhythm[k % rhythm.length]!;
    // Take the rhythm's block, or exactly what is left; never leave a lone photo behind.
    let take = size;
    if (left <= size || (left - size === 1 && left <= 6)) take = left;
    else if (left - size === 1) take = size - 1;
    const options = blocks[take]!;
    tiles.push(...(take === size ? options[variant % options.length]! : options[0]!));
    left -= take;
  }
  return tiles;
}
