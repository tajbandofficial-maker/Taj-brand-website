/** Site structure (routes), not business content. */
export const primaryNav = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Packages", href: "/packages" },
  { label: "Gallery", href: "/gallery" },
  { label: "Reviews", href: "/reviews" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerExplore = [
  { label: "Home", href: "/" },
  { label: "About Taj Band", href: "/about" },
  { label: "Packages & Pricing", href: "/packages" },
  { label: "Gallery", href: "/gallery" },
  { label: "Reviews", href: "/reviews" },
  { label: "Contact / Booking", href: "/contact" },
] as const;

/**
 * How many services the home/about grids and the footer show before "All services".
 * Keep it a multiple of 4 so the 1/2/4-column grids end on a full row.
 */
export const FEATURED_SERVICES = 8;

export function serviceHref(slug: string): string {
  return `/services/${slug}`;
}

/** True when `pathname` is `href` or inside it (e.g. /services/dhol-players → Services). */
export function isActivePath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Services menu groups (header dropdown). Services not listed here join the last group. */
export const serviceMenuGroups = [
  {
    key: "music",
    label: "Music & band",
    slugs: [
      "brass-band-baraat",
      "dhol-players",
      "nashik-dhol",
      "tasha-players",
      "shehnai-live-music",
      "dj-on-wheels",
      "baraat-anchors",
    ],
  },
  {
    key: "rides",
    label: "Rides & royal entry",
    slugs: [
      "ghodi",
      "horse-rental",
      "baggi",
      "vintage-cars",
      "luxury-cars",
      "atv-bikes",
      "flower-chattar",
    ],
  },
  {
    key: "more",
    label: "Lights, effects & more",
    slugs: [
      "wedding-lighting",
      "sfx-effects",
      "co2-confetti-guns",
      "pagdi",
      "bar-on-wheels",
      "custom-baraat",
    ],
  },
] as const;

export type ServiceMenuGroupKey = (typeof serviceMenuGroups)[number]["key"];

/** Splits services (already in display order) into the menu groups; empty groups are dropped. */
export function groupServicesForMenu<T extends { slug: string }>(
  services: T[],
): { key: ServiceMenuGroupKey; label: string; items: T[] }[] {
  const last = serviceMenuGroups.length - 1;
  const groups = serviceMenuGroups.map((g) => ({ key: g.key, label: g.label, items: [] as T[] }));
  for (const s of services) {
    const i = serviceMenuGroups.findIndex((g) => (g.slugs as readonly string[]).includes(s.slug));
    groups[i === -1 ? last : i]!.items.push(s);
  }
  return groups.filter((g) => g.items.length > 0);
}
