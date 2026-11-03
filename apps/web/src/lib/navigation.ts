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
