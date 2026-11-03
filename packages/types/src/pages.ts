import type { GalleryVideo, ImageAsset } from "./content.js";

/**
 * Editable content of the site's fixed pages (admin → Pages).
 *
 * Each field's `default` is the copy the page shows until an admin saves
 * something else, so a fresh database still renders a complete site. The admin
 * form, the API validation and the public pages all read this one definition.
 */

export type PageFieldDef = {
  /** Admin panel heading the field is grouped under, in page order. */
  section: string;
  label: string;
  default: string;
  max: number;
  multiline?: boolean;
  help?: string;
};

export type PageDef = {
  label: string;
  path: string;
  fields: Record<string, PageFieldDef>;
  /** Large photo at the top of the page. */
  heroImage?: { help: string };
  /** Featured YouTube video. */
  video?: { help: string };
  /** Search result title & description when the admin leaves SEO empty. */
  seo: { title: string; description: string };
};

const text = (section: string, label: string, value: string, max = 120, help?: string) =>
  ({ section, label, default: value, max, help }) satisfies PageFieldDef;
const para = (section: string, label: string, value: string, max = 600, help?: string) =>
  ({ section, label, default: value, max, help, multiline: true }) satisfies PageFieldDef;

const mapFields = {
  mapEyebrow: text("India map", "Small heading", "TBO around India"),
  mapTitle: text(
    "India map",
    "Heading",
    "Tap a heart to know the journey so far",
    120,
    "Hearts come from Site settings → Areas served.",
  ),
};

export const pageDefs = {
  home: {
    label: "Home",
    path: "/",
    heroImage: { help: "The large photo next to the main heading." },
    video: { help: "Shown in a “Watch a trailer” block below the India map. Leave empty to hide." },
    fields: {
      heroTitle: text("Top of page", "Main heading", "The baraat Delhi"),
      heroAccent: text(
        "Top of page",
        "Heading — gold words",
        "remembers.",
        60,
        "Shown in gold italics after the main heading.",
      ),
      heroText: para(
        "Top of page",
        "Intro text",
        "Brass band, dhol, DJ on wheels, umbrella lights and vintage cars — one booking for your whole procession, across Delhi-NCR.",
        300,
      ),
      heroButton: text("Top of page", "Main button", "Check your date", 40),
      legacyEyebrow: text("Our legacy", "Small heading", "Our legacy"),
      legacyTitle: text(
        "Our legacy",
        "Heading",
        "The legacy of Taj Band",
        120,
        "The text below it is the first paragraph of the About page story.",
      ),
      legacyLink: text("Our legacy", "Link text", "Read our story", 40),
      ...mapFields,
      videoEyebrow: text("Featured video", "Small heading", "Watch a trailer"),
      videoTitle: text("Featured video", "Heading", "See a Taj Band baraat"),
      videoCaption: text("Featured video", "Caption under the video", "Taj Band baraat highlights"),
      servicesEyebrow: text("Services", "Small heading", "Our services"),
      servicesTitle: text("Services", "Heading", "Everything your baraat needs"),
      packagesEyebrow: text("Packages", "Small heading", "Packages"),
      packagesTitle: text("Packages", "Heading", "Pick a baraat, we handle the rest"),
      packagesText: para(
        "Packages",
        "Text",
        "Every package can be customised — tap one to get its price on WhatsApp.",
        300,
      ),
      galleryEyebrow: text("Gallery", "Small heading", "Gallery"),
      galleryTitle: text("Gallery", "Heading", "Recent baraats"),
      reviewsEyebrow: text("Reviews", "Small heading", "Reviews"),
      reviewsTitle: text("Reviews", "Heading", "Families keep calling us back"),
      bookingTitle: text("Booking form", "Heading", "Is your date still open?"),
      bookingText: para(
        "Booking form",
        "Text",
        "Peak muhurat dates book out months ahead. Send your date and we'll confirm availability and a quote within the hour.",
        400,
      ),
      bookingButton: text("Booking form", "Button", "Check availability", 40),
    },
    seo: {
      title: "Taj Band — Wedding Band & Baraat, Delhi",
      description:
        "Taj Band, New Delhi — brass band, dhol, DJ on wheels, umbrella lights, vintage cars and baggi. One booking for your whole baraat across Delhi-NCR.",
    },
  },
  about: {
    label: "About",
    path: "/about",
    heroImage: { help: "The photo at the top of the About page. Empty = first gallery photo." },
    video: { help: "Shown first in the “Watch a trailer” block, before gallery videos." },
    fields: {
      heroEyebrow: text("Top of page", "Small heading", "About us"),
      heroTitle: text("Top of page", "Main heading", "The legacy of"),
      heroAccent: text("Top of page", "Heading — gold words", "Taj Band", 60),
      heroTagline: text("Top of page", "Tagline", "Magic · Memories · Music"),
      heroText: para(
        "Top of page",
        "Intro text",
        "Every celebration deserves a soulful memory. We bring the band, the beats, the lights and the royal ride — so your family only has to dance.",
        300,
      ),
      storyEyebrow: text("Our story", "Small heading", "Our story"),
      storyTitle: text("Our story", "Heading", "From one beat to a legacy"),
      story: para(
        "Our story",
        "Story",
        "",
        4000,
        "Leave a blank line between paragraphs. The first paragraph also appears on the home page.",
      ),
      whyEyebrow: text("Why choose us", "Small heading", "Why choose us"),
      whyTitle: text("Why choose us", "Heading", "Why choose Taj Band?"),
      whyText: para(
        "Why choose us",
        "Text",
        "Because your celebration deserves nothing but the best. With years of experience, unmatched energy and a passion for making every baraat unforgettable, Taj Band isn't just a band — it's a celebration in motion. From traditional beats to modern vibes, we bring your moments to life.",
        600,
      ),
      ...mapFields,
      servicesEyebrow: text("Services", "Small heading", "What we bring"),
      servicesTitle: text("Services", "Heading", "A complete baraat, from one team"),
      servicesText: para(
        "Services",
        "Text",
        "Expert dholis, live performers, lights, vintage cars and DJ on wheels — booked with one call.",
        300,
      ),
      videosEyebrow: text("Videos", "Small heading", "Watch a trailer"),
      videosTitle: text("Videos", "Heading", "See a Taj Band baraat"),
      videoCaption: text(
        "Videos",
        "Featured video caption",
        "Taj Band baraat highlights",
        120,
        "Shown under the featured video (set below).",
      ),
      reviewsTitle: text("Reviews", "Heading", "Here's what our families say"),
      ctaTitle: text("Call to action", "Heading", "Let's make your celebration magical."),
      ctaText: para(
        "Call to action",
        "Text",
        "Tell us your date and venue — we'll suggest the right package and confirm availability.",
        300,
      ),
    },
    seo: {
      title: "About Us — Wedding Band in Delhi Since 1946",
      description:
        "The story of Taj Band: a family wedding band from New Delhi bringing brass band, dhol, DJ on wheels, lights and vintage cars to baraats since 1946.",
    },
  },
  services: {
    label: "Services",
    path: "/services",
    fields: {
      eyebrow: text("Top of page", "Small heading", "Our services"),
      title: text(
        "Top of page",
        "Main heading",
        "Wedding band services, from the first beat to the bidaai",
      ),
      text: para(
        "Top of page",
        "Intro text",
        "Book one service or combine them into a single procession. One team, one call, one invoice.",
        300,
      ),
      backdrop: text(
        "Top of page",
        "Background words",
        "Baraat · Dhol · Shehnai",
        60,
        "Large outlined words drifting behind the heading.",
      ),
    },
    seo: {
      title: "Wedding Band & Baraat Services in Delhi",
      description:
        "Brass band, dhol, DJ on wheels, umbrella lights, vintage cars and shehnai across Delhi-NCR — book one service or combine them into a single procession.",
    },
  },
  packages: {
    label: "Packages",
    path: "/packages",
    fields: {
      eyebrow: text("Top of page", "Small heading", "Packages & Pricing"),
      title: text("Top of page", "Main heading", "Baraat packages for every size of celebration"),
      text: para(
        "Top of page",
        "Intro text",
        "Every package is customisable. Tap any package to get today's price for your date on WhatsApp.",
        300,
      ),
      compareTitle: text("Sections", "Comparison table heading", "Compare packages"),
      addOnsTitle: text("Sections", "Add-ons heading", "Add to any package"),
      ctaTitle: text("Sections", "Bottom banner", "Need something custom? We'll build it for you."),
      ctaButton: text("Sections", "Bottom banner button", "Send your requirements", 40),
    },
    seo: {
      title: "Baraat Packages & Pricing in Delhi",
      description:
        "Eight baraat packages — from King's to Carnival — with brass band, dhol, DJ on wheels, umbrella lights, vintage cars and baggi. Every package is customisable.",
    },
  },
  gallery: {
    label: "Gallery",
    path: "/gallery",
    fields: {
      eyebrow: text("Top of page", "Small heading", "Gallery"),
      title: text("Top of page", "Main heading", "Photos & videos from recent baraats"),
      videosTitle: text("Videos", "Heading", "Watch us live"),
      videosText: para(
        "Videos",
        "Text",
        "Videos load only when tapped, so the page stays fast.",
        300,
      ),
    },
    seo: {
      title: "Baraat Photos & Videos in Delhi",
      description:
        "Photos and videos of Taj Band baraats across Delhi-NCR: brass band, dhol, DJ on wheels, umbrella lights, vintage cars and baggi.",
    },
  },
  reviews: {
    label: "Reviews",
    path: "/reviews",
    fields: {
      eyebrow: text("Top of page", "Small heading", "Reviews & Proof"),
      title: text("Top of page", "Main heading", "Trusted by families — and on screen"),
      listTitle: text("Reviews", "Heading", "What families say"),
      ctaTitle: text("Reviews", "Bottom banner", "Ready to be our next review?"),
    },
    seo: {
      title: "Reviews — Wedding Band in Delhi",
      description:
        "What families say about Taj Band — Google reviews from weddings, baraats, receptions and religious functions across Delhi.",
    },
  },
  contact: {
    label: "Contact",
    path: "/contact",
    fields: {
      eyebrow: text("Top of page", "Small heading", "Contact / Booking"),
      title: text("Top of page", "Main heading", "Check your date with Taj Band"),
      text: para(
        "Top of page",
        "Intro text",
        "Fastest reply on WhatsApp. Or fill the form and we'll call you within the hour.",
        300,
      ),
      formButton: text("Top of page", "Form button", "Send enquiry", 40),
      mapTitle: text("Map", "Heading", "Find us"),
    },
    seo: {
      title: "Contact & Booking — Wedding Band in Delhi",
      description:
        "Check your wedding date with Taj Band. Fastest reply on WhatsApp, or send an enquiry and we'll call you within the hour.",
    },
  },
} as const satisfies Record<string, PageDef>;

export type PageKey = keyof typeof pageDefs;
export type PageFieldKey<K extends PageKey> = keyof (typeof pageDefs)[K]["fields"] & string;
export const pageKeys = Object.keys(pageDefs) as PageKey[];

export function isPageKey(key: string): key is PageKey {
  return Object.hasOwn(pageDefs, key);
}

/** Stored fields merged over the defaults; blank values fall back to the default. */
export function resolvePageText<K extends PageKey>(
  key: K,
  stored: Record<string, string>,
): Record<PageFieldKey<K>, string> {
  const fields: Record<string, PageFieldDef> = pageDefs[key].fields;
  return Object.fromEntries(
    Object.entries(fields).map(([k, def]) => [k, stored[k]?.trim() || def.default]),
  ) as Record<PageFieldKey<K>, string>;
}

/** Accepts a YouTube URL (watch, youtu.be, shorts, embed) or a bare 11-character id. */
export function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return m?.[1] ?? null;
}

/** Public shape of one page's content (GET /public/pages/:key). */
export type PublicPage = {
  key: PageKey;
  /** Only what the admin saved; merge with `resolvePageText` for display. */
  fields: Record<string, string>;
  heroImage: ImageAsset | null;
  video: GalleryVideo | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: ImageAsset | null;
};
