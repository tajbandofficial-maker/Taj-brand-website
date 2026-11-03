import { ALL_PUBLIC_TAG, chunk, planInvalidation } from "./invalidation-plan.js";

const all = ["brass-band-baraat", "dhol-players"];

describe("planInvalidation", () => {
  it("service rename revalidates old + new slug and purges every service page", () => {
    const plan = planInvalidation({ entity: "service", slugs: ["old-slug", "dhol-players"] }, all);
    expect(plan.tags).toEqual(["services", "service:old-slug", "service:dhol-players"]);
    expect(plan.purge).toEqual(
      expect.arrayContaining([
        "/",
        "/services",
        "/services/brass-band-baraat",
        "/about",
        "/services/old-slug",
        "/sitemap.xml",
      ]),
    );
  });

  it("packages, add-ons and comparison rows share the packages tag", () => {
    for (const entity of ["package", "addon", "comparison"] as const) {
      const plan = planInvalidation({ entity }, all);
      expect(plan.tags).toEqual(["packages"]);
      expect(plan.purge).toContain("/packages");
    }
  });

  it("a service FAQ only touches that service page", () => {
    expect(planInvalidation({ entity: "faq", serviceSlugs: ["dhol-players"] }, all)).toEqual({
      tags: ["faqs", "service:dhol-players"],
      purge: ["/services/dhol-players"],
    });
  });

  it("a global FAQ touches every service page", () => {
    const plan = planInvalidation({ entity: "faq", serviceSlugs: [] }, all);
    expect(plan.purge).toEqual([
      "/services",
      "/services/brass-band-baraat",
      "/services/dhol-players",
    ]);
  });

  it("a page edit refreshes that page; About also refreshes Home", () => {
    expect(planInvalidation({ entity: "page", key: "contact" }, all)).toEqual({
      tags: ["page:contact"],
      purge: ["/contact"],
    });
    expect(planInvalidation({ entity: "page", key: "about" }, all).purge).toEqual(["/about", "/"]);
  });

  it("settings revalidate everything and purge the whole zone", () => {
    expect(planInvalidation({ entity: "settings" }, all)).toEqual({
      tags: [ALL_PUBLIC_TAG],
      purge: "everything",
    });
  });

  it("chunks purge lists to Cloudflare's 30-URL limit", () => {
    const parts = chunk(Array.from({ length: 65 }, (_, i) => i));
    expect(parts.map((p) => p.length)).toEqual([30, 30, 5]);
  });
});
