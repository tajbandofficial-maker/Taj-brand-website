import { pageDefs, type PageKey } from "@taj/types";

/**
 * Entity → Next cache tags → Cloudflare URLs (ARCHITECTURE.md §4.5).
 * Pure so it can be unit-tested without network or database.
 */

/** Umbrella tag on every public fetch; revalidating it refreshes everything. */
export const ALL_PUBLIC_TAG = "public";

export type InvalidationEvent =
  | { entity: "service"; slugs: string[] } // old + new slug when renamed
  | { entity: "package" | "addon" | "comparison" }
  | { entity: "gallery"; serviceSlugs?: string[] }
  | { entity: "review" }
  | { entity: "faq"; serviceSlugs: string[] } // empty = global FAQ
  | { entity: "page"; key: PageKey }
  | { entity: "settings" | "media" };

export type InvalidationPlan = {
  tags: string[];
  /** Paths to purge at the edge, or "everything". */
  purge: string[] | "everything";
};

const servicePaths = (slugs: string[]) => slugs.map((s) => `/services/${s}`);
const uniq = <T>(xs: T[]) => [...new Set(xs)];

export function planInvalidation(
  e: InvalidationEvent,
  allServiceSlugs: string[],
): InvalidationPlan {
  const everyService = ["/services", ...servicePaths(allServiceSlugs)];

  switch (e.entity) {
    case "service":
      return {
        tags: uniq(["services", ...e.slugs.map((s) => `service:${s}`)]),
        // Related-services blocks mean every service page changes too.
        purge: uniq(["/", "/about", ...everyService, ...servicePaths(e.slugs), "/sitemap.xml"]),
      };
    case "package":
    case "addon":
    case "comparison":
      return { tags: ["packages"], purge: uniq(["/", "/packages", ...everyService]) };
    case "gallery":
      return {
        tags: uniq(["gallery", ...(e.serviceSlugs ?? []).map((s) => `service:${s}`)]),
        purge: uniq(["/", "/about", "/gallery", "/reviews", ...everyService]),
      };
    case "review":
      return { tags: ["reviews"], purge: uniq(["/", "/about", "/reviews", ...everyService]) };
    case "faq":
      return e.serviceSlugs.length > 0
        ? {
            tags: uniq(["faqs", ...e.serviceSlugs.map((s) => `service:${s}`)]),
            purge: servicePaths(e.serviceSlugs),
          }
        : { tags: ["faqs"], purge: everyService };
    case "page":
      return {
        tags: [`page:${e.key}`],
        // The home page shows the first paragraph of the About story.
        purge: e.key === "about" ? ["/about", "/"] : [pageDefs[e.key].path],
      };
    case "settings":
    case "media":
      // Settings feed the header/footer/JSON-LD on every page; media can be anywhere.
      return { tags: [ALL_PUBLIC_TAG], purge: "everything" };
  }
}

/** Cloudflare's free plan accepts at most 30 URLs per purge call. */
export function chunk<T>(items: T[], size = 30): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
