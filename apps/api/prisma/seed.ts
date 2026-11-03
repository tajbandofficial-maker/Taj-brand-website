/**
 * Seed data (ARCHITECTURE.md §15). Run: `pnpm --filter api prisma db seed`
 *
 * Content comes from the client's current site (tajbandofficial.com, Oct 2026):
 * contact details, story, packages, Google reviews, photos and YouTube trailers.
 * Facts that site doesn't state (prices, hours, Google rating) stay null.
 *
 * Safe to re-run: services/packages are upserted by slug, settings by id, the
 * admin is created only if missing, and list tables are filled only when empty.
 *
 * `-- --refresh` also overwrites settings, services, packages, FAQs and the
 * comparison table with the content below, and swaps the earlier placeholder
 * reviews, add-ons and Unsplash gallery photos for the real ones. Admin-added
 * reviews, photos, packages and add-ons are kept.
 * `-- --refresh=services,gallery,addons` refreshes only the listed sections.
 */
import "dotenv/config";

import bcrypt from "bcryptjs";

import {
  GalleryCategory,
  GalleryType,
  PrismaClient,
  ReviewSource,
} from "../src/generated/prisma/client.js";
import { createMariaDbAdapter } from "../src/prisma/mariadb.js";

const prisma = new PrismaClient({
  adapter: createMariaDbAdapter(process.env.DATABASE_URL!),
});

/**
 * `--refresh` overwrites every seeded section; `--refresh=services,gallery` only those.
 * Sections: settings, pages, services, packages, addons, reviews, gallery.
 */
const refreshArg = process.argv.find((a) => a === "--refresh" || a.startsWith("--refresh="));
const refreshOnly = new Set(refreshArg?.split("=")[1]?.split(",") ?? []);
const refreshes = (section: string) => refreshArg === "--refresh" || refreshOnly.has(section);

/** Unsplash sample, for services the client has no photo of yet. */
async function sample(id: string, alt: string) {
  const key = `sample/${id}`;
  return prisma.media.upsert({
    where: { key },
    create: {
      key,
      url: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=75`,
      mimeType: "image/jpeg",
      alt,
    },
    update: {},
  });
}

/** Client photo shipped with the web app (apps/web/public/photos). */
const photos = {
  "dream-baraat-banner": [
    "Dream Baraat by Taj Band banner amid confetti and umbrella lights",
    1536,
    1024,
  ],
  "band-umbrella-lights-horses": [
    "Taj Band crew in red uniforms with umbrella lights and decorated horses",
    1536,
    1024,
  ],
  "couple-floral-baggi-confetti": [
    "Bride and groom on a flower-decorated baggi under falling confetti",
    1536,
    1024,
  ],
  "groom-name-lighting-letters": ["Groom's name in lighting letters on a DJ truss", 1536, 1024],
  "dhol-players-dj": [
    "Dhol players and band leading a baraat in front of a DJ on wheels",
    1536,
    864,
  ],
  "baggi-feathered-horses": ["Groom's baggi drawn by plumed horses with cold pyro", 1536, 1024],
  "guests-confetti-shower": ["Baraat guests dancing in a confetti shower", 1536, 864],
  "co2-jets-umbrella-lights": ["CO2 jets firing over a baraat lit by umbrella lights", 1536, 864],
  "baraat-procession-night": [
    "Night baraat procession with umbrella lights and beam lights",
    1536,
    1024,
  ],
  "confetti-pyro-dj": ["Confetti and pyro over a DJ on wheels with the groom's name", 1536, 864],
  "floral-baggi-wheel": [
    "Close-up of a baggi decorated with fresh orchids and flowers",
    1536,
    1024,
  ],
  "baraat-dancing-umbrella-lights": [
    "Family dancing under umbrella lights at a baraat",
    1536,
    1024,
  ],
  "decorated-ghodi": ["Decorated white ghodi with handler at a wedding venue", 1536, 864],
  "groom-confetti-gun": ["Groom firing a confetti gun from a flower-decorated baggi", 1536, 1024],
  "flower-chattar-groom": [
    "Groom under a flower-decorated chattar with the band in green sherwanis",
    1536,
    864,
  ],
  "sfx-pyro-name-board": [
    "Cold pyro and lights over the groom's name board at a night baraat",
    1536,
    864,
  ],
  "baraat-procession-confetti": [
    "Taj Band procession with uniformed band, confetti and umbrella lights",
    1536,
    862,
  ],
  "pagdi-baraat-guests": ["Baraat guests in orange pagdis dancing with the band", 1280, 720],
  "bar-on-wheels": ["Illuminated bar on wheels rolling with the baraat", 1280, 720],
  "band-guards-umbrella-lights": [
    "Band in guard uniforms walking under umbrella lights",
    1280,
    720,
  ],
  "dhol-troupe-yellow": ["Dhol players in yellow outfits leading a baraat", 1280, 720],
  "white-vintage-car": ["White vintage car decorated with flowers for the groom", 1280, 720],
  "co2-spotlight-band": ["CO2 jet and spotlight over the band and umbrella lights", 1280, 720],
  "umbrella-lights-night": ["Double-floor umbrella lights lighting up a night baraat", 1280, 720],
  "brass-band-musicians": [
    "Taj Band musicians in uniform playing trumpets and tuba at a baraat",
    1536,
    643,
  ],
  "baggi-two-horses": ["Flower-decorated baggi drawn by two decorated white horses", 1536, 642],
  "bar-on-wheels-drinks": ["Drinks being poured at the bar on wheels", 1536, 642],
  "dhol-players-on-dj": ["Dhol players performing on top of a DJ on wheels", 1536, 643],
  "street-musicians-orange": [
    "Musicians in orange costumes playing dhol in a street procession",
    1536,
    642,
  ],
  "groom-hand-pyros": ["Groom and friends holding hand pyros on a flower baggi", 1536, 642],
  "fireworks-over-dj": ["Fireworks bursting over the DJ on wheels at night", 1536, 642],
  "confetti-pyro-dj-night": ["Confetti and pyros over a lit DJ on wheels", 1536, 642],
  "groom-confetti-open-car": [
    "Groom and friends celebrating in confetti in an open car",
    1536,
    642,
  ],
  "daytime-baraat-umbrellas": ["Daytime baraat with red umbrella lights and the band", 1536, 643],
  "umbrella-lights-rows": ["Rows of double-floor umbrella lights at a night baraat", 1536, 642],
  "dhol-troupe-colourful": ["Dhol players in colourful outfits leading a night baraat", 1536, 642],
  "baraat-grand-venue": ["Baraat with umbrella lights arriving at a grand venue", 1536, 642],
  "dj-truss-groom-name": ["DJ on wheels truss with the groom's name in lights", 1536, 643],
  // Client photo shoot, Nov 2026 (shown first in the gallery).
  "groom-chattar-sparklers": [
    "Groom on a royal flower chattar with sparklers and confetti",
    1600,
    2000,
  ],
  "red-vintage-car-pink-flowers": [
    "Red vintage car decorated with pink flowers for the groom",
    1600,
    2400,
  ],
  "band-navy-gold-uniform": ["Taj Band musician in a navy and gold band uniform", 1600, 2400],
  "dj-name-board-cold-pyro": [
    "Cold pyro firing at a DJ on wheels with the groom's name in lights",
    1600,
    1600,
  ],
  "floral-baggi-night-orchids": [
    "Wedding baggi covered in orchids and garlands at a night baraat",
    1600,
    2400,
  ],
  "groomsmen-blue-pagdis": ["Groomsmen in matching blue pagdis and printed jackets", 1600, 2400],
  "white-vintage-car-roses": ["White vintage car decorated with pink roses", 1600, 2400],
  "band-umbrella-lights-procession": [
    "Taj Band procession with umbrella lights and the band's name board",
    1600,
    1067,
  ],
  "groom-on-ghodi": ["Groom riding a decorated white ghodi under a royal umbrella", 1600, 2000],
  "dj-truck-led-screens": ["DJ on wheels with LED screens and a lit truss", 1600, 2400],
  "wedding-baggi-yellow-flowers": [
    "Wedding baggi decorated with yellow and white flowers",
    1600,
    2400,
  ],
  "groom-pastel-pagdi-baraat": ["Groom and guests in pastel pagdis at the baraat", 1600, 2400],
  "red-vintage-car-umbrellas": [
    "Red vintage car with umbrella lights at a daytime baraat",
    1600,
    1067,
  ],
  "band-uniforms-white-red": ["Taj Band uniforms in white and royal red", 1600, 2400],
  "dj-truck-flower-arch": [
    "DJ on wheels with a flower arch and the groom's name in lights",
    1600,
    2133,
  ],
  "lit-floral-baggi-canopy": ["Floral baggi with a lit canopy, ready for the groom", 1600, 2400],
  "groom-press-interview": ["Groom speaking to the press at his baraat", 1600, 1067],
  "groom-white-vintage-car": [
    "Groom beside a white vintage car decorated with flowers",
    1600,
    2400,
  ],
  "smoke-effects-baraat-dance": ["Guests dancing in smoke effects at a baraat", 1600, 1067],
  "floral-baggi-gurgaon": ["Flower-decorated baggi at a baraat in Gurgaon", 1600, 1280],
  "groom-floral-safa": ["Groom in a floral printed safa", 1600, 2400],
  "dj-stage-family-dance": [
    "Family dancing in front of a DJ stage with the groom's name in lights",
    1600,
    1920,
  ],
  "red-vintage-car-white-flowers": ["Red vintage car with white flowers and ribbons", 1600, 1280],
  "floral-baggi-orchids-day": ["Baggi decorated with orchids and garlands in daylight", 1600, 1067],
  "groom-celebrating-baraat": [
    "Groom in a printed sherwani and safa celebrating at his baraat",
    1600,
    2400,
  ],
  "floral-baggi-garlands": ["Baggi covered in flower garlands", 1600, 1067],
} as const satisfies Record<string, readonly [string, number, number]>;
type PhotoName = keyof typeof photos;

async function photo(name: PhotoName) {
  const [alt, width, height] = photos[name];
  const key = `site/${name}.jpg`;
  return prisma.media.upsert({
    where: { key },
    create: { key, url: `/photos/${name}.jpg`, mimeType: "image/jpeg", width, height, alt },
    update: {},
  });
}

const aboutStory = [
  "In 1946, we started with nothing but a dream and a belief that every celebration deserves a soulful memory. With a small team and limited resources, we worked tirelessly, one beat at a time, putting our soul into bringing joy to your weddings, festivals and special occasions.",
  "Over the years, our dedication, discipline and love for music transformed us into one of the most trusted names in the industry.",
  "Today, we proudly offer grand, unforgettable experiences with expert dholis, live performers, lights, vintage cars and complete baraat solutions. What began as a humble journey has become a legacy — creating memories, touching hearts and making celebrations truly magical.",
].join("\n\n");

type SeedService = {
  slug: string;
  /** Short name for menus, cards and the enquiry form. */
  title: string;
  h1: string;
  /** Google search title — matches the service name on the Google Business Profile. */
  seoTitle: string;
  /** Google search description (120–160 characters). */
  seoDescription: string;
  shortDescription: string;
  intro: string;
  body: string;
  inclusions: string[];
  hero: { photo: PhotoName } | { sample: [string, string] };
  faqs: [string, string][];
};

const ASK = "Send your date and venue on WhatsApp and we'll confirm availability.";

/** Services as listed on the Google Business Profile, plus shehnai from the site design. */
const services: SeedService[] = [
  {
    slug: "brass-band-baraat",
    title: "Brass Band",
    h1: "Brass band service for your baraat in Delhi",
    seoTitle: "Brass Band Service in Delhi",
    seoDescription:
      "Book Taj Band's traditional brass band in Delhi — 11 to 31 uniformed musicians playing baraat anthems, Bollywood hits and classics since 1946.",
    shortDescription: "Uniformed traditional brass band of 11, 15, 21 or 31 musicians.",
    intro:
      "Uniformed musicians and a roaring brass section leading the groom from the first step to the venue gate — the sound Taj Band has been known for since 1946.",
    body: "Our packages come with an 11, 15, 21 or 31-man traditional brass band. Pair it with dhol, DJ on wheels, umbrella lights and a vintage car or baggi so the whole procession comes from one team.",
    inclusions: [
      "11, 15, 21 or 31-man brass band",
      "Musicians in matching uniforms",
      "Baraat anthems, Bollywood & classics",
      "Plays alongside dhol & DJ on wheels",
      "Double-floor umbrella lights",
      "Vintage car or horse baggi",
    ],
    hero: { photo: "brass-band-musicians" },
    faqs: [
      [
        "How many musicians can I book?",
        "Our packages include an 11, 15, 21 or 31-man traditional brass band: King's, Majestic and Prestige have 11, Knight's 15, The Taj 21 and Carnival 31.",
      ],
      [
        "Can the brass band play with a DJ?",
        "Yes. Majestic, Prestige, The Taj and Carnival pair the brass band with DJ on wheels, played by a professional DJ.",
      ],
      [
        "Where are you based?",
        "Our studio is in Tagore Garden, New Delhi, and we play baraats across Delhi-NCR. Ask us on WhatsApp for weddings further away.",
      ],
    ],
  },
  {
    slug: "dhol-players",
    title: "Dhol Players",
    h1: "Professional dhol players for your wedding in Delhi",
    seoTitle: "Professional Dhol Players for Wedding in Delhi",
    seoDescription:
      "Hire professional dhol players for weddings in Delhi NCR. Energetic Punjabi dhol for the baraat, sangeet and mehendi — 4 to 5 dholis in every package.",
    shortDescription: "Energetic professional dholis for the baraat and every function.",
    intro:
      "Professional dholis who keep the baraat dancing non-stop — for the baraat, sangeet, mehendi or any family function.",
    body: "Every package includes 4 or 5 professional dhol players, and Carnival brings 7 Punjabi dhol players together with a tasha party and Nashik dhol. Extra dholis can be added to any package.",
    inclusions: [
      "4–5 dhol players in every package",
      "Energetic Punjabi dhol",
      "Plays with brass band & DJ",
      "Baraat, sangeet & mehendi",
      "Receptions & religious functions",
      "Add more dholis to any package",
    ],
    hero: { photo: "dhol-players-dj" },
    faqs: [
      [
        "Are dhol players included in the packages?",
        "Yes. King's and Knight's include 4 dhol players; Duke's, Majestic, Royal's, Prestige and The Taj include 5; Carnival includes 21 across three styles.",
      ],
      [
        "Can I book dhol for other functions?",
        "Yes — families book us for religious functions, birthdays and receptions as well as baraats.",
      ],
      [
        "Can I add more dhol players?",
        `Yes, extra dhol players can be added to any package. ${ASK}`,
      ],
    ],
  },
  {
    slug: "nashik-dhol",
    title: "Nashik Dhol",
    h1: "Nashik dhol for weddings in Delhi",
    seoTitle: "Nashik Dhol for Wedding in Delhi",
    seoDescription:
      "Book Nashik dhol for weddings and baraats in Delhi NCR with Taj Band — a powerful Maharashtrian dhol troupe that plays alongside the brass band.",
    shortDescription: "Powerful Maharashtrian Nashik dhol for a booming baraat.",
    intro:
      "The thunder of Maharashtrian Nashik dhol — big drums played together by a troupe, with a beat the whole baraat moves to.",
    body: "Nashik dhol brings the festival sound of Maharashtra to your baraat. Carnival includes a 7-man Nashik dhol troupe alongside Punjabi dhol and a tasha party, and Nashik dhol can be added to any other package.",
    inclusions: [
      "Maharashtrian Nashik dhol troupe",
      "Traditional festival rhythms",
      "7-man troupe in Carnival",
      "Plays alongside brass band & DJ",
      "Add to any package",
      "Baraats across Delhi-NCR",
    ],
    hero: {
      sample: ["1774438464558-a3f4c6aad0a5", "Nashik dhol players in orange leading a procession"],
    },
    faqs: [
      [
        "How is Nashik dhol different from Punjabi dhol?",
        "Nashik dhols are larger and played together by a troupe in set Maharashtrian rhythms, for a deeper, booming sound.",
      ],
      [
        "Which package includes Nashik dhol?",
        `Carnival includes a 7-man Nashik dhol troupe; it can be added to any other package. ${ASK}`,
      ],
      [
        "Can Nashik dhol play with the brass band?",
        "Yes, the troupe plays alongside the brass band, Punjabi dhol and DJ on wheels.",
      ],
    ],
  },
  {
    slug: "tasha-players",
    title: "Tasha Players",
    h1: "Tasha players for your baraat in Delhi",
    seoTitle: "Tasha Players for Baraat in Delhi",
    seoDescription:
      "Hire tasha players for baraat celebrations in Delhi NCR with Taj Band — crisp, fast tasha rhythms that play alongside the dhol and brass band.",
    shortDescription: "Crisp, fast tasha rhythms that set the pace of the baraat.",
    intro:
      "The sharp, fast beat of the tasha — the drum that sets the pace for the whole procession.",
    body: "Carnival includes a 7-man Rajasthani tasha party, and a tasha group can be added to any other package to play alongside the dhol and brass band.",
    inclusions: [
      "Traditional tasha party",
      "7-man tasha party in Carnival",
      "Pairs with dhol & Nashik dhol",
      "Plays alongside the brass band",
      "Add to any package",
      "Baraats & festivals",
    ],
    hero: {
      sample: [
        "1768656833256-062e65c21578",
        "Drummer carrying a set of tasha drums in a procession",
      ],
    },
    faqs: [
      [
        "Which package includes tasha?",
        "Carnival includes a 7-man Rajasthani tasha party; it can be added to any other package.",
      ],
      [
        "Can tasha play with dhol?",
        "Yes — tasha and dhol are traditionally played together, and our tasha party plays alongside the dhol and brass band.",
      ],
      ["How do I book tasha players?", ASK],
    ],
  },
  {
    slug: "dj-on-wheels",
    title: "DJ on Wheels",
    h1: "DJ on wheels for your wedding in Delhi",
    seoTitle: "DJ on Wheels for Wedding in Delhi",
    seoDescription:
      "Make your baraat unforgettable with Taj Band's DJ on wheels in Delhi NCR — a loader or 22 ft truck DJ with JBL sound, lights and a professional DJ.",
    shortDescription: "Mobile DJ on a loader or 22 ft truck, played by a professional DJ.",
    intro:
      "A moving DJ stage that travels with your baraat — played by a professional DJ, with JBL sound, RCF line arrays and the groom's name in lights.",
    body: "Duke's and Majestic use a DJ on a small loader. Royal's, Prestige, The Taj and Carnival step up to a 22 ft truck with a 4-side truss. Every DJ comes with LED and sharpy lights, a silent genset and the groom's name highlighted in lighting letters.",
    inclusions: [
      "Small loader or 22 ft truck",
      "4-side truss on the truck DJ",
      "Professional DJ player",
      "JBL sound system with RCF line array",
      "LED & sharpy lights, silent genset",
      "Groom's name in lighting letters",
    ],
    hero: { photo: "groom-name-lighting-letters" },
    faqs: [
      [
        "Which packages include DJ on wheels?",
        "Duke's and Majestic (small loader), and Royal's, Prestige, The Taj and Carnival (22 ft truck with a 4-side truss).",
      ],
      [
        "Who plays the music?",
        "A professional DJ travels on the vehicle and plays your baraat set, alongside the brass band and dhol.",
      ],
      [
        "Are CO2 jets and perfume fog available?",
        "CO2 jets and perfume fog on the DJ are included in The Taj and Carnival, and can be added to other packages.",
      ],
    ],
  },
  {
    slug: "baraat-anchors",
    title: "Male & Female Anchors",
    h1: "Male and female anchors for your baraat in Delhi",
    seoTitle: "Male and Female Anchors for Baraat in Delhi",
    seoDescription:
      "Book male and female anchors for baraat celebrations in Delhi NCR with Taj Band — professional hosts who announce the groom and keep the energy high.",
    shortDescription: "Professional anchors to host the baraat and keep the energy high.",
    intro:
      "Professional male and female anchors who host the baraat, keep the energy high and bring both families into the celebration.",
    body: "Our anchors work alongside the band and DJ — announcing the groom's arrival, getting the families dancing and keeping the procession on time. Book a male anchor, a female anchor or a pair.",
    inclusions: [
      "Male, female or a pair of anchors",
      "Hosting & announcements",
      "Groom's entry announcement",
      "Gets both families dancing",
      "Keeps the baraat on schedule",
      "Works with the band & DJ",
    ],
    hero: {
      sample: [
        "1695147964022-8b2ebd45e343",
        "Wedding host speaking on a microphone beside the bride",
      ],
    },
    faqs: [
      ["Can I book both a male and a female anchor?", "Yes — book one anchor or a pair."],
      [
        "Do the anchors work with the band and DJ?",
        "Yes, they coordinate with the band and DJ so the music and announcements flow together.",
      ],
      ["How do I book an anchor?", ASK],
    ],
  },
  {
    slug: "wedding-lighting",
    title: "Fancy Lights",
    h1: "Fancy lights for your wedding baraat in Delhi",
    seoTitle: "Fancy Lights for Wedding in Delhi",
    seoDescription:
      "Light up your baraat in Delhi NCR with Taj Band's fancy lights — 8 to 30 double-floor umbrella lights, LED and sharpy lights and the groom's name in lights.",
    shortDescription: "Double-floor umbrella lights, LED & sharpy lights and name letters.",
    intro:
      "Double-floor umbrella lights carried along the route, LED and sharpy lights on the DJ, and the groom's name — say, “Taj Ki Baraat” — in lighting letters.",
    body: "Packages include 8 to 30 double-floor umbrella lights. From Duke's upwards you also get LED and sharpy lights on a silent genset, plus the groom's name in lighting letters.",
    inclusions: [
      "8 to 30 double-floor umbrella lights",
      "LED & sharpy lights",
      "Silent genset",
      "Groom's name in lighting letters",
      "Lights carried along the route",
      "More umbrella lights on request",
    ],
    hero: { photo: "umbrella-lights-night" },
    faqs: [
      [
        "How many umbrella lights are included?",
        "King's, Duke's and Majestic have 8, Royal's 10, Knight's 12, Prestige 16, The Taj 20 and Carnival 30 double-floor umbrella lights.",
      ],
      ["Is the generator noisy?", "No — our lights run on a silent genset."],
      [
        "Can you write the groom's name in lights?",
        "Yes. From Duke's upwards the groom's name (for example “Taj Ki Baraat”) is highlighted in lighting letters.",
      ],
    ],
  },
  {
    slug: "sfx-effects",
    title: "SFX Effects",
    h1: "SFX for your wedding in Delhi",
    seoTitle: "SFX for Wedding in Delhi",
    seoDescription:
      "Make your baraat spectacular with special effects by Taj Band in Delhi NCR — cold pyros, CO2 jets, confetti, perfume fog and rose-petal shots.",
    shortDescription: "Cold pyros, CO2 jets, confetti and perfume fog for the big moments.",
    intro:
      "Make the big moments land — cold pyros, CO2 jets, confetti and perfume fog timed to the groom's entry and the baraat's arrival.",
    body: "Our special-effects crew adds cold pyros, CO2 jets, confetti shots, perfume fog and rose-petal showers at the moments that matter, running together with the DJ on wheels and lights for a show-stopping procession.",
    inclusions: [
      "Hand pyros & cold pyros",
      "CO2 jets on the DJ",
      "Confetti shots",
      "Perfume fog",
      "Rose-petal shots",
      "Timed to your big moments",
    ],
    hero: { photo: "sfx-pyro-name-board" },
    faqs: [
      [
        "Which packages include effects?",
        "Knight's to Prestige include a CO2 & confetti gun; The Taj adds CO2 jets and perfume fog on the DJ; Carnival adds CO2 and confetti for the complete baraat plus rose-petal shots.",
      ],
      ["Can I add effects to any package?", `Yes. ${ASK}`],
      [
        "Does my venue allow pyros?",
        "Rules differ by venue — tell us where the baraat is and we'll plan effects that fit.",
      ],
    ],
  },
  {
    slug: "co2-confetti-guns",
    title: "CO2 & Confetti Guns",
    h1: "CO2 gun, pyros and confetti gun for your wedding in Delhi",
    seoTitle: "CO2 Gun, Pyros and Confetti Gun in Delhi",
    seoDescription:
      "Add excitement to your wedding in Delhi NCR with CO2 jets, confetti guns and suitable pyro effects from Taj Band, handled by our own crew.",
    shortDescription: "CO2 jets, confetti guns and pyros to light up the baraat.",
    intro:
      "Add excitement to your wedding with CO2 jets, confetti guns and suitable pyrotechnic effects.",
    body: "From Knight's upwards every package includes a CO2 & confetti gun. The Taj adds CO2 jets and perfume fog on the DJ, and Carnival covers the complete baraat with CO2 and confetti shots.",
    inclusions: [
      "CO2 & confetti gun (Knight's and up)",
      "CO2 jets on the DJ",
      "Confetti shots for the baraat",
      "Cold pyros",
      "Perfume fog",
      "Handled by our crew",
    ],
    hero: { photo: "co2-jets-umbrella-lights" },
    faqs: [
      [
        "Which packages include a CO2 & confetti gun?",
        "Knight's, Duke's, Majestic, Royal's and Prestige include one; The Taj and Carnival add CO2 jets and more.",
      ],
      ["Can I add CO2 jets to my package?", `Yes. ${ASK}`],
      [
        "Who operates the effects?",
        "Our own crew handles the CO2 and confetti guns during the procession.",
      ],
    ],
  },
  {
    slug: "ghodi",
    title: "Ghodi",
    h1: "Ghodi rental for your baraat in Delhi",
    seoTitle: "Ghodi Rental for Baraat in Delhi",
    seoDescription:
      "Book a decorated ghodi for your wedding baraat with Taj Band in Delhi NCR — a traditional ride for the groom, with its handler, alongside the band.",
    shortDescription: "A beautifully decorated ghodi for the groom's entry.",
    intro:
      "Celebrate tradition with a decorated ghodi for the groom — dressed in colourful finery and led by its handler.",
    body: "Add a ghodi to any package for the groom's ride to the venue. The ghodi comes decorated and with its handler, and walks with the band, dhol and lights.",
    inclusions: [
      "Decorated ghodi",
      "Handler included",
      "Groom's ride to the venue",
      "Walks with the band & lights",
      "Add to any package",
      "Photo-ready finery",
    ],
    hero: { photo: "decorated-ghodi" },
    faqs: [
      ["Is a handler included?", "Yes, the ghodi comes with its handler."],
      ["Can I add a ghodi to a package?", `Yes, a ghodi can be added to any package. ${ASK}`],
      [
        "Do you also have a baggi or vintage car?",
        "Yes — every package includes a vintage car or 2-horse baggi decorated with real flowers.",
      ],
    ],
  },
  {
    slug: "horse-rental",
    title: "Horse Rental",
    h1: "Horse rental service for your wedding in Delhi",
    seoTitle: "Horse Rental Service for Wedding in Delhi",
    seoDescription:
      "Book horse rental for your baraat with Taj Band in Delhi NCR — decorated horses for the groom's ghodi, the baggi and escort riders in the procession.",
    shortDescription:
      "Decorated horses for the baraat — for the groom, the baggi and escort riders.",
    intro:
      "Make the groom's wedding procession royal with decorated horses — for the groom's entry, the baggi and escort riders.",
    body: "Taj Band arranges decorated horses for baraats in Delhi NCR: a ghodi for the groom, horses to draw the baggi, and escort riders for the procession. Carnival includes a 4-horse baggi and two riders in presidential-guard costume on horseback.",
    inclusions: [
      "Decorated horses for the baraat",
      "Ghodi for the groom",
      "Horses for the baggi",
      "Escort riders (Carnival)",
      "Handlers with the horses",
      "Add to any package",
    ],
    hero: { photo: "baggi-two-horses" },
    faqs: [
      ["Do the horses come with handlers?", "Yes, our handlers come with the horses."],
      [
        "Which package includes riders on horseback?",
        "Carnival includes two riders in presidential-guard costume on horseback, plus a 4-horse baggi with an attached roof.",
      ],
      ["How do I book horses for the baraat?", ASK],
    ],
  },
  {
    slug: "baggi",
    title: "Flower Baggi",
    h1: "Baggi with original flowers for your wedding in Delhi",
    seoTitle: "Baggi with Original Flowers for Wedding in Delhi",
    seoDescription:
      "Add traditional elegance to your wedding in Delhi NCR with a horse-drawn baggi decorated with real flowers from Taj Band — 2-horse or 4-horse.",
    shortDescription: "Horse-drawn baggi decorated with real flowers.",
    intro: "Add traditional elegance with a horse-drawn baggi decorated with fresh, real flowers.",
    body: "Every package includes one vintage car or a 2-horse baggi decorated with real flowers. Carnival upgrades to a 4-horse baggi with an attached roof, escorted by two riders in presidential-guard costume.",
    inclusions: [
      "2-horse baggi in every package",
      "Decorated with real flowers",
      "4-horse roofed baggi (Carnival)",
      "Riders in presidential-guard costume (Carnival)",
      "Groom's grand entry",
      "Photo-ready styling",
    ],
    hero: { photo: "couple-floral-baggi-confetti" },
    faqs: [
      ["Are the flowers real?", "Yes — our baggis are decorated with real, fresh flowers."],
      [
        "Which package has the 4-horse baggi?",
        "Carnival, with an attached roof and two riders in presidential-guard costume on horseback.",
      ],
      [
        "Can I choose a vintage car instead?",
        "Yes — packages include a vintage car or a 2-horse baggi; pick the one you like.",
      ],
    ],
  },
  {
    slug: "vintage-cars",
    title: "Vintage Cars",
    h1: "Vintage car rental for your baraat in Delhi",
    seoTitle: "Vintage Cars Rental for Baraat in Delhi",
    seoDescription:
      "Choose a vintage car for your wedding baraat in Delhi NCR with Taj Band — classic cars decorated with real flowers for a timeless entry for the groom.",
    shortDescription: "Classic vintage cars decorated with flowers for the groom.",
    intro:
      "Arrive in style in a classic vintage car decorated with flowers — a timeless entry for the groom.",
    body: "Every package from King's to The Taj includes one vintage car or a 2-horse baggi decorated with real flowers, so you can choose the car for a classic entry.",
    inclusions: [
      "Classic vintage car",
      "Decorated with real flowers",
      "Included in King's to The Taj",
      "Groom's grand entry",
      "Drives with the baraat",
      "Photo-ready styling",
    ],
    hero: { photo: "white-vintage-car" },
    faqs: [
      [
        "Is a vintage car included in the packages?",
        "Yes — King's to The Taj include one vintage car or a 2-horse baggi; choose the car.",
      ],
      ["Are the decorations real flowers?", "Yes, cars are decorated with real flowers."],
      [
        "Do you have modern luxury cars too?",
        "Yes — see Luxury Cars for the groom, or ask us on WhatsApp.",
      ],
    ],
  },
  {
    slug: "luxury-cars",
    title: "Luxury Cars",
    h1: "Luxury car rental for the groom in Delhi",
    seoTitle: "Luxury Cars Rental for Groom in Delhi",
    seoDescription:
      "Taj Band arranges luxury cars for groom arrivals and weddings in Delhi NCR — make an unforgettable entry, decorated to match your celebration.",
    shortDescription: "Luxury cars for the groom's arrival.",
    intro:
      "Make the groom's arrival unforgettable in a luxury car, decorated for the occasion if you like.",
    body: "Taj Band arranges luxury cars for groom arrivals and weddings in Delhi NCR. Tell us the look you want and your date, and we'll share the cars available.",
    inclusions: [
      "Luxury car for the groom",
      "Decoration on request",
      "Groom's arrival & venue entry",
      "Matches your theme",
      "Delhi-NCR weddings",
      "Book with any package",
    ],
    hero: {
      sample: ["1760188281860-8779d86f0b5d", "Luxury car with flowers on the passenger seat"],
    },
    faqs: [
      [
        "Which cars are available?",
        "Availability changes by date — send your date on WhatsApp and we'll share the options.",
      ],
      ["Can the car be decorated?", "Yes — tell us your theme and we'll decorate it to match."],
      ["Can I book a luxury car with a package?", `Yes. ${ASK}`],
    ],
  },
  {
    slug: "atv-bikes",
    title: "ATV Bikes",
    h1: "ATV bike rental for your wedding in Delhi",
    seoTitle: "ATV Bike Rental for Wedding in Delhi",
    seoDescription:
      "Explore ATV bike rental for weddings in Delhi NCR with Taj Band — a bold, fun entry for the groom and friends, planned around your venue.",
    shortDescription: "ATV bikes for a bold, fun entry at the baraat.",
    intro:
      "Something different for the baraat — ATV bikes for a bold, fun entry that guests will talk about.",
    body: "Explore ATV bike arrangements for suitable wedding events in Delhi NCR. Tell us your venue and plan, and we'll confirm what works for the space and timing.",
    inclusions: [
      "ATV bikes for the baraat",
      "Bold groom or friends' entry",
      "Planned around your venue",
      "Pairs with lights & SFX",
      "Delhi-NCR weddings",
      "Add to any package",
    ],
    hero: {
      sample: ["1678554833410-3f9f2b26ac01", "ATV quad bike with headlights on at night"],
    },
    faqs: [
      [
        "Can ATVs be used at every venue?",
        "It depends on the venue and route — share yours and we'll confirm.",
      ],
      ["Can ATVs join the baraat with the band?", "Yes, where the venue and route allow it."],
      ["How do I book ATV bikes?", ASK],
    ],
  },
  {
    slug: "flower-chattar",
    title: "Flower Chattar",
    h1: "Flower chattar for your wedding in Delhi",
    seoTitle: "Flower Chattar for Wedding in Delhi",
    seoDescription:
      "Enhance your wedding baraat in Delhi NCR with a decorative flower chattar from Taj Band — flowers and lights carried over the groom.",
    shortDescription: "A decorative flower chattar carried over the groom.",
    intro:
      "Enhance your baraat with a decorative flower chattar — a canopy of flowers and lights carried over the groom.",
    body: "Our flower chattar is decorated with flowers and lights and carried over the groom through the procession, framing him beautifully for photos and adding a royal touch.",
    inclusions: [
      "Flower-decorated chattar",
      "Lights on the chattar",
      "Carried over the groom",
      "Prince chhatar for the groom",
      "Double chhatar lights",
      "Add to any package",
    ],
    hero: { photo: "flower-chattar-groom" },
    faqs: [
      ["Who carries the chattar?", "Our team carries it over the groom through the procession."],
      ["Can the flowers match our theme?", "Yes — tell us your colours and we'll match them."],
      ["Can I add a chattar to a package?", `Yes. ${ASK}`],
    ],
  },
  {
    slug: "pagdi",
    title: "Pagdi",
    h1: "Pagdi for your baraat in Delhi",
    seoTitle: "Pagdi for Baraat in Delhi",
    seoDescription:
      "Arrange wedding pagdis for your baraat with Taj Band in Delhi NCR — traditional pagdis and safas in your colours for the groom's family and friends.",
    shortDescription: "Traditional pagdis and safas for the baraat.",
    intro:
      "Arrange wedding pagdis for your baraat — traditional headwear that makes the whole family look the part.",
    body: "Choose traditional pagdis or safas for the groom's family and friends, in colours that match your wedding. Tell us how many you need and the colours, and we'll arrange them for the baraat.",
    inclusions: [
      "Traditional pagdis & safas",
      "Colours to match your theme",
      "For the groom's family & friends",
      "Ready for the baraat",
      "Matches the band's look",
      "Add to any package",
    ],
    hero: { photo: "pagdi-baraat-guests" },
    faqs: [
      ["Can we choose the colours?", "Yes — tell us your theme colours and we'll match them."],
      ["How many pagdis can you arrange?", `Tell us your guest count. ${ASK}`],
      ["Can I add pagdis to a package?", "Yes, pagdis can be added to any package."],
    ],
  },
  {
    slug: "bar-on-wheels",
    title: "Bar on Wheels",
    h1: "Bar on wheels for your wedding in Delhi",
    seoTitle: "Bar on Wheels for Wedding in Delhi",
    seoDescription:
      "Explore bar on wheels for suitable wedding events in Delhi NCR with Taj Band — an illuminated bar that rolls with the baraat, band and DJ.",
    shortDescription: "An illuminated bar on wheels that moves with the baraat.",
    intro:
      "A lit-up bar on wheels that rolls with the procession — a fun stop for the baraatis on the way to the venue.",
    body: "Explore bar on wheels arrangements for suitable wedding events in Delhi NCR. The bar is decorated with lights and moves with the band and DJ; drinks and serving follow your arrangements and the venue's rules.",
    inclusions: [
      "Illuminated bar on wheels",
      "Moves with the procession",
      "Decorated with lights",
      "Fits with the band & DJ",
      "Sheesha on wheels also available",
      "Add to any package",
    ],
    hero: { photo: "bar-on-wheels" },
    faqs: [
      [
        "Who arranges the drinks?",
        "Drinks and serving follow your arrangements and the venue's rules — tell us your plan and we'll set up the bar on wheels to match.",
      ],
      [
        "Can it join any baraat?",
        "Where the venue and route allow it — share yours and we'll confirm.",
      ],
      ["How do I book it?", ASK],
    ],
  },
  {
    slug: "custom-baraat",
    title: "Customized Baraat",
    h1: "Customized baraat arrangements in Delhi",
    seoTitle: "Customized Baraat Arrangements in Delhi",
    seoDescription:
      "Taj Band creates customized baraat arrangements in Delhi NCR — choose the band, dhol, DJ on wheels, lights, the groom's ride and effects.",
    shortDescription: "Mix band, dhol, DJ, lights, rides and effects your way.",
    intro:
      "Your baraat, your way — Taj Band creates customized baraat arrangements to match your preferences.",
    body: "Start from any package or build from scratch: choose the brass band size, dhol styles, DJ on wheels, umbrella lights, the groom's ride and special effects. We plan it all as one procession with one team.",
    inclusions: [
      "Choose your band size",
      "Dhol, Nashik dhol & tasha",
      "DJ on wheels & lights",
      "Ghodi, baggi or cars",
      "Carnival artists, SFX & confetti",
      "One team, one plan",
    ],
    hero: { photo: "baraat-procession-confetti" },
    faqs: [
      ["Can I change a package?", "Yes — every package can be customised."],
      [
        "How do I start?",
        "Send your date, venue and wishlist on WhatsApp and we'll suggest the right setup.",
      ],
      [
        "Can you plan everything for the baraat?",
        "Yes — band, dhol, DJ, lights, rides and effects come from one team.",
      ],
    ],
  },
  {
    slug: "shehnai-live-music",
    title: "Shehnai & Live Music",
    h1: "Shehnai and live music for your pheras in Delhi",
    seoTitle: "Shehnai & Live Music for Weddings in Delhi",
    seoDescription:
      "Book shehnai and live music for weddings in Delhi NCR with Taj Band — traditional shehnai with tabla for the pheras and live musicians for the evening.",
    shortDescription: "Traditional shehnai for pheras and live musicians for the evening.",
    intro:
      "The sound of a traditional shehnai at the mandap — plus live musicians for the welcome, jaimala and dinner.",
    body: "Our shehnai players perform with tabla and harmonium for ceremonies, and we can add a live singer or instrumental ensemble for the evening.",
    inclusions: [
      "Shehnai with tabla accompaniment",
      "Pheras, jaimala & welcome",
      "Harmonium & live vocals",
      "Soft instrumental for dinner",
      "Sound setup included",
      "Pairs with baraat band",
    ],
    hero: { sample: ["1587271407850-8d438ca9fdf2", "Shehnai player at a wedding ceremony"] },
    faqs: [
      [
        "When is shehnai usually played?",
        "Most families book it for the welcome, jaimala and pheras.",
      ],
      ["Do you bring sound equipment?", "Yes, a compact sound setup is included."],
      ["Can you play at a temple or gurudwara?", "Yes, we adapt the set to the venue."],
    ],
  },
];
/** Renamed slugs (old → new), applied to existing rows when services are refreshed. */
const renamedServiceSlugs: Record<string, string> = { "vintage-cars-chattar": "vintage-cars" };

// Shared package lines, worded as in the client's package brochure (Taj Band Packages.pdf).
const truckDj = "DJ on wheels on a 22 ft truck with 4-side truss, played by a professional DJ";
const loaderDj = "DJ on wheels on a small loader, played by a professional DJ";
const nameLights = "Groom's name (e.g. Taj Ki Baraat) highlighted in lighting letters";
const ledLights = "LED lights, sharpy lights & silent genset";
const sound = "Sound setup with JBL sound system and RCF line array";
const ride = "1 vintage car or 2-horse baggi decorated with original flowers";
const co2 = "CO2 & confetti gun";

/** In brochure order. */
const packages = [
  {
    slug: "kings",
    name: "King's",
    tagline: "Brass band, dhol, umbrella lights & a royal ride",
    inclusions: [
      "11-man traditional brass band",
      "8 double-floor umbrella lights",
      "4 professional dhol players",
      ride,
    ],
  },
  {
    slug: "knights",
    name: "Knight's",
    tagline: "15-man brass band with CO2 & confetti",
    inclusions: [
      "15-man traditional brass band",
      "12 double-floor umbrella lights",
      "4 professional dhol players",
      ride,
      co2,
    ],
  },
  {
    slug: "dukes",
    name: "Duke's",
    tagline: "DJ on wheels with dhol & lights",
    inclusions: [
      loaderDj,
      nameLights,
      ledLights,
      sound,
      ride,
      "5 professional dhol players",
      "8 double-floor umbrella lights",
      co2,
    ],
  },
  {
    slug: "royals",
    name: "Royal's",
    tagline: "Truck-mounted DJ with 4-side truss",
    inclusions: [
      truckDj,
      nameLights,
      ledLights,
      sound,
      ride,
      "5 professional dhol players",
      "10 double-floor umbrella lights",
      co2,
    ],
  },
  {
    slug: "majestic",
    name: "Majestic",
    tagline: "Brass band and DJ on wheels together",
    inclusions: [
      "11-man traditional brass band",
      loaderDj,
      nameLights,
      ledLights,
      sound,
      ride,
      "5 professional dhol players",
      "8 double-floor umbrella lights",
      co2,
    ],
  },
  {
    slug: "prestige",
    name: "Prestige",
    tagline: "Brass band, truck DJ & 16 umbrella lights",
    inclusions: [
      "11-man traditional brass band",
      truckDj,
      nameLights,
      ledLights,
      sound,
      ride,
      "5 professional dhol players",
      "16 double-floor umbrella lights",
      co2,
    ],
  },
  {
    slug: "the-taj",
    name: "The Taj",
    tagline: "21-man band with CO2 jets & perfume fog",
    inclusions: [
      "21-man traditional brass band",
      truckDj,
      nameLights,
      `${ledLights}, JBL sound system and RCF line array`,
      ride,
      "5 professional dhol players",
      "20 double-floor umbrella lights",
      "CO2, confetti gun, CO2 jets & perfume fog on DJ",
      "6 bride & groom name crystals",
    ],
  },
  {
    slug: "carnival",
    name: "Carnival",
    tagline: "Carnival theme — the full carnival baraat",
    inclusions: [
      "31-man traditional brass band",
      truckDj,
      nameLights,
      `${ledLights}, JBL sound system and RCF line array`,
      "7 professional Punjabi dhol players",
      "7-man Rajasthani tasa party",
      "7-man Maharashtrian Nashik dhol",
      "5 carnival artists",
      "30 double-floor umbrella lights",
      "4-horse baggi with attached roof, decorated with original flowers",
      "2 Russian girls in presidential-guard costume on horses",
      "CO2 gun for the complete baraat",
      "Confetti shots for the complete baraat",
      "CO2 jets on DJ",
      "Perfume fog on DJ",
      "Rose petal shots",
      "6 bride & groom name crystals",
    ],
  },
];
/** Slugs from the first seed, before the client's real packages were known. */
const legacyPackageSlugs = ["classic", "royal", "grand"];

/** Values follow the package order above. */
const comparison: [string, string[]][] = [
  [
    "Traditional brass band",
    ["11 men", "15 men", "—", "—", "11 men", "11 men", "21 men", "31 men"],
  ],
  [
    "DJ on wheels",
    [
      "—",
      "—",
      "Small loader",
      "22 ft truck",
      "Small loader",
      "22 ft truck",
      "22 ft truck",
      "22 ft truck",
    ],
  ],
  ["Dhol players", ["4", "4", "5", "5", "5", "5", "5", "21 (dhol, tasa & Nashik)"]],
  ["Double-floor umbrella lights", ["8", "12", "8", "10", "8", "16", "20", "30"]],
  [
    "Vintage car / baggi",
    [
      "Car or 2-horse baggi",
      "Car or 2-horse baggi",
      "Car or 2-horse baggi",
      "Car or 2-horse baggi",
      "Car or 2-horse baggi",
      "Car or 2-horse baggi",
      "Car or 2-horse baggi",
      "4-horse roofed baggi",
    ],
  ],
  ["Groom's name in lights", ["—", "—", "✓", "✓", "✓", "✓", "✓", "✓"]],
  ["LED & sharpy lights, JBL sound", ["—", "—", "✓", "✓", "✓", "✓", "✓", "✓"]],
  [
    "CO2 & confetti",
    ["—", "✓", "✓", "✓", "✓", "✓", "✓ + CO2 jets & fog", "✓ + jets, fog & rose petals"],
  ],
  [
    "Extras",
    ["—", "—", "—", "—", "—", "—", "6 name crystals", "Carnival artists, riders, 6 name crystals"],
  ],
];

/** The brochure's "Additional items" (name, description, linked service page or null). */
const addOns: [string, string, string | null][] = [
  ["Bar on Wheels", "An illuminated bar that rolls with the baraat.", "bar-on-wheels"],
  ["Sheesha on Wheels", "A sheesha lounge on wheels for the baraatis.", null],
  [
    "Carnival Artists",
    "Costumed carnival performers for a show-stopping procession.",
    "custom-baraat",
  ],
  ["Hand Pyros", "Handheld cold pyros for the groom and friends.", "sfx-effects"],
  ["CO2 Gun for Complete Baraat", "CO2 blasts along the whole procession.", "co2-confetti-guns"],
  [
    "Confetti Shots for Complete Baraat",
    "Confetti bursts all the way to the venue.",
    "co2-confetti-guns",
  ],
  ["Flower Chhatar", "A flower-decorated chhatar carried over the groom.", "flower-chattar"],
  ["Prince Chhatar for Groom", "A royal prince-style chhatar for the groom.", "flower-chattar"],
  ["Double Chhatar Light", "Double-floor chhatar lights along the route.", "wedding-lighting"],
  ["Name Crystal", "Bride & groom name crystals that light up the procession.", null],
];
/** Add-ons from earlier seeds, replaced by the brochure list on refresh. */
const legacyAddOnNames = [
  "Extra dhol",
  "Ghodi / horse",
  "Lighting upgrade",
  "Vintage car",
  "Ghodi for the groom",
  "Vintage car or baggi",
  "More umbrella lights",
  "Extra dhol players",
  "CO2 jets & perfume fog",
];

/** Google reviews shown on the client's site (all 5★), quoted verbatim. */
const reviews: { author: string; meta: string | null; text: string; featured: boolean }[] = [
  {
    author: "Aastha Bhardwaj",
    meta: "Wedding baraat",
    text: "Taj band made our wedding baarat full of energy and joy.the dhol beats had everyone dancing non-stop",
    featured: true,
  },
  {
    author: "Sakshi Jain",
    meta: "Wedding · Delhi",
    text: "Their coordination and rhythm were fantastic. Truly one of the best wedding bands I’ve seen in Delhi.",
    featured: true,
  },
  {
    author: "Diya Sharma",
    meta: "Reception",
    text: "We booked taj band for a recpetion and ther played a perfect mix of traditional and modern tunes",
    featured: true,
  },
  {
    author: "Harshit Sharma",
    meta: "Religious function",
    text: "Taj band,s perfomance at our relegious function was soulful and created a beautiful atmoshphere",
    featured: false,
  },
  {
    author: "Manoj Sharma",
    meta: "Birthday",
    text: "At my cousin's birthday,Taj band brought so much life with their cheerful music . Everyone loved it",
    featured: false,
  },
  {
    author: "Anjali Kumari",
    meta: null,
    text: "Perfect beats and rhythm, made everyone dance without stopping.",
    featured: false,
  },
  {
    author: "Anjali Kumari",
    meta: null,
    text: "Great sound system and lighting, it was the best party ever.",
    featured: false,
  },
  {
    author: "Saloni Kashyap",
    meta: "DJ night",
    text: "Superb DJ performance, the crowd was full of energy all night.",
    featured: false,
  },
];

const gallery: [PhotoName, GalleryCategory, string | null][] = [
  ["groom-chattar-sparklers", "CARS_CHATTAR", "flower-chattar"],
  ["red-vintage-car-pink-flowers", "CARS_CHATTAR", "vintage-cars"],
  ["band-navy-gold-uniform", "BAND", "brass-band-baraat"],
  ["dj-name-board-cold-pyro", "LIGHTING", "dj-on-wheels"],
  ["floral-baggi-night-orchids", "CARS_CHATTAR", "baggi"],
  ["groomsmen-blue-pagdis", "BARAAT", "pagdi"],
  ["white-vintage-car-roses", "CARS_CHATTAR", "vintage-cars"],
  ["band-umbrella-lights-procession", "BAND", "brass-band-baraat"],
  ["groom-on-ghodi", "CARS_CHATTAR", "ghodi"],
  ["dj-truck-led-screens", "LIGHTING", "dj-on-wheels"],
  ["wedding-baggi-yellow-flowers", "CARS_CHATTAR", "baggi"],
  ["groom-pastel-pagdi-baraat", "BARAAT", "pagdi"],
  ["red-vintage-car-umbrellas", "CARS_CHATTAR", "vintage-cars"],
  ["band-uniforms-white-red", "BAND", "brass-band-baraat"],
  ["dj-truck-flower-arch", "LIGHTING", "dj-on-wheels"],
  ["lit-floral-baggi-canopy", "CARS_CHATTAR", "baggi"],
  ["groom-press-interview", "BARAAT", "custom-baraat"],
  ["groom-white-vintage-car", "CARS_CHATTAR", "vintage-cars"],
  ["smoke-effects-baraat-dance", "LIGHTING", "sfx-effects"],
  ["floral-baggi-gurgaon", "CARS_CHATTAR", "baggi"],
  ["groom-floral-safa", "BARAAT", "pagdi"],
  ["dj-stage-family-dance", "LIGHTING", "dj-on-wheels"],
  ["red-vintage-car-white-flowers", "CARS_CHATTAR", "vintage-cars"],
  ["floral-baggi-orchids-day", "CARS_CHATTAR", "baggi"],
  ["groom-celebrating-baraat", "BARAAT", "custom-baraat"],
  ["floral-baggi-garlands", "CARS_CHATTAR", "baggi"],
  ["dream-baraat-banner", "BAND", "brass-band-baraat"],
  ["band-umbrella-lights-horses", "CARS_CHATTAR", "horse-rental"],
  ["couple-floral-baggi-confetti", "CARS_CHATTAR", "baggi"],
  ["groom-name-lighting-letters", "LIGHTING", "dj-on-wheels"],
  ["dhol-players-dj", "DHOL", "dhol-players"],
  ["baggi-feathered-horses", "CARS_CHATTAR", "baggi"],
  ["guests-confetti-shower", "BARAAT", "sfx-effects"],
  ["co2-jets-umbrella-lights", "LIGHTING", "co2-confetti-guns"],
  ["baraat-procession-night", "BARAAT", "brass-band-baraat"],
  ["confetti-pyro-dj", "LIGHTING", "sfx-effects"],
  ["floral-baggi-wheel", "CARS_CHATTAR", "baggi"],
  ["baraat-dancing-umbrella-lights", "BARAAT", "custom-baraat"],
  ["decorated-ghodi", "CARS_CHATTAR", "ghodi"],
  ["groom-confetti-gun", "BARAAT", "co2-confetti-guns"],
  ["white-vintage-car", "CARS_CHATTAR", "vintage-cars"],
  ["flower-chattar-groom", "CARS_CHATTAR", "flower-chattar"],
  ["pagdi-baraat-guests", "BARAAT", "pagdi"],
  ["bar-on-wheels", "BARAAT", "bar-on-wheels"],
  ["sfx-pyro-name-board", "LIGHTING", "sfx-effects"],
  ["baraat-procession-confetti", "BARAAT", "custom-baraat"],
  ["band-guards-umbrella-lights", "BAND", "brass-band-baraat"],
  ["dhol-troupe-yellow", "DHOL", "dhol-players"],
  ["co2-spotlight-band", "LIGHTING", "co2-confetti-guns"],
  ["umbrella-lights-night", "LIGHTING", "wedding-lighting"],
  ["brass-band-musicians", "BAND", "brass-band-baraat"],
  ["baggi-two-horses", "CARS_CHATTAR", "horse-rental"],
  ["bar-on-wheels-drinks", "BARAAT", "bar-on-wheels"],
  ["dhol-players-on-dj", "DHOL", "dhol-players"],
  ["street-musicians-orange", "DHOL", "custom-baraat"],
  ["groom-hand-pyros", "LIGHTING", "sfx-effects"],
  ["fireworks-over-dj", "LIGHTING", "sfx-effects"],
  ["confetti-pyro-dj-night", "LIGHTING", "co2-confetti-guns"],
  ["groom-confetti-open-car", "CARS_CHATTAR", "vintage-cars"],
  ["daytime-baraat-umbrellas", "BAND", "brass-band-baraat"],
  ["umbrella-lights-rows", "LIGHTING", "wedding-lighting"],
  ["dhol-troupe-colourful", "DHOL", "dhol-players"],
  ["baraat-grand-venue", "BARAAT", "custom-baraat"],
  ["dj-truss-groom-name", "LIGHTING", "dj-on-wheels"],
];

/** Trailers embedded on the client's site (YouTube channel @tajbandofficial). */
const videos: [string, string][] = [
  ["0M1dGLrOgkg", "Young India ki First Choice — a Taj Band baraat"],
  ["8CnpzpqCtPY", "Best Wedding of 2025"],
  ["NmumxAo707c", "Baarati aa gaye oye!"],
];

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const minLength = process.env.NODE_ENV === "production" ? 12 : 1;
  if (!email || !password || password.length < minLength) {
    console.warn(
      `⚠ SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD (${minLength}+ chars) not set — skipping admin user.`,
    );
    return;
  }
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`✓ Admin ${email} already exists (password unchanged)`);
    return;
  }
  await prisma.adminUser.create({
    data: { email, name: "Admin", passwordHash: await bcrypt.hash(password, 12) },
  });
  console.log(`✓ Created admin ${email}`);
}

async function main() {
  if (refreshArg) console.log(`↻ ${refreshArg}: overwriting seeded content`);
  await seedAdmin();

  const homeHero = await photo("groom-confetti-gun");
  // Default share image: the band's own banner, so shared links show the brand.
  const shareImage = await photo("dream-baraat-banner");
  const settings = {
    phone: "+91 95608 02046",
    whatsapp: "919560802046",
    email: "tajbandofficial@gmail.com",
    // As printed in the package brochure.
    addressLine: "WZ-1A/13, Titarpur, opposite Metro Pillar No. 434, Tagore Garden",
    altPhone: "+91 95608 02096",
    city: "New Delhi",
    postalCode: "110027",
    // Not listed on the client's site; add in the admin when confirmed.
    hours: [],
    // Unconfirmed facts stay null so the site hides them (§1 principle 5).
    googleRating: null,
    googleReviewCount: 807,
    // Resolves to the "Taj Band - Old is Gold" listing at the Tagore Garden address.
    mapEmbedUrl: "https://www.google.com/maps?q=Taj+Band+-+Tagore+Garden,+New+Delhi&output=embed",
    googleProfileUrl: "https://www.google.com/maps/place/?q=place_id:ChIJS3CRffoDDTkRdVeblvNcMWI",
    foundedYear: 1946,
    weddingsPerformed: null,
    netflixUrl: null,
    socials: {
      instagram: "https://www.instagram.com/tajbandofficial",
      facebook: "https://www.facebook.com/tajbandofficial",
      youtube: "https://www.youtube.com/@tajbandofficial",
    },
    seoDescription:
      "Taj Band, New Delhi — brass band, dhol, DJ on wheels, umbrella lights, vintage cars and baggi since 1946. One booking for your whole baraat across Delhi-NCR.",
    ogImageId: shareImage.id,
    // Cities from the brochure cover (hearts on the India map).
    serviceAreas: ["Delhi", "Gurugram", "Noida", "Jaipur", "Haridwar", "Dehradun", "Mussoorie"],
    ticker: [
      "Brass Band",
      "Dhol",
      "DJ on Wheels",
      "Umbrella Lights",
      "Vintage Cars",
      "Baggi & Ghodi",
      "Confetti & CO2",
    ],
  };
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...settings },
    update: refreshes("settings") ? settings : {},
  });
  console.log("✓ Site settings");

  // Page copy defaults live in @taj/types (pageDefs); seed only what differs.
  const home = { heroImageId: homeHero.id, youtubeId: videos[0]![0] };
  await prisma.pageContent.upsert({
    where: { key: "home" },
    create: { key: "home", fields: {}, ...home },
    update: refreshes("pages") ? home : {},
  });
  const about = await prisma.pageContent.findUnique({ where: { key: "about" } });
  const aboutFields = { ...((about?.fields ?? {}) as Record<string, string>), story: aboutStory };
  await prisma.pageContent.upsert({
    where: { key: "about" },
    create: { key: "about", fields: aboutFields },
    update: refreshes("pages") ? { fields: aboutFields } : {},
  });
  console.log("✓ Page content (home hero & video, about story)");

  if (refreshes("services")) {
    for (const [from, to] of Object.entries(renamedServiceSlugs)) {
      const taken = await prisma.service.findUnique({ where: { slug: to } });
      if (!taken) await prisma.service.updateMany({ where: { slug: from }, data: { slug: to } });
    }
  }
  const serviceIds: Record<string, string> = {};
  for (const [order, s] of services.entries()) {
    const hero = "photo" in s.hero ? await photo(s.hero.photo) : await sample(...s.hero.sample);
    const data = {
      title: s.title,
      h1: s.h1,
      shortDescription: s.shortDescription,
      intro: s.intro,
      sections: [{ heading: "What's included", body: s.body }],
      inclusions: s.inclusions,
      heroImageId: hero.id,
      seoTitle: s.seoTitle,
      seoDescription: s.seoDescription,
      order,
      published: true,
    };
    const row = await prisma.service.upsert({
      where: { slug: s.slug },
      create: { slug: s.slug, ...data },
      update: refreshes("services") ? data : {},
    });
    serviceIds[s.slug] = row.id;
    if (refreshes("services")) await prisma.faq.deleteMany({ where: { serviceId: row.id } });
    if ((await prisma.faq.count({ where: { serviceId: row.id } })) === 0) {
      await prisma.faq.createMany({
        data: s.faqs.map(([question, answer], i) => ({
          question,
          answer,
          serviceId: row.id,
          order: i,
        })),
      });
    }
  }
  console.log(`✓ ${services.length} services + FAQs`);

  if (refreshes("packages"))
    await prisma.package.deleteMany({ where: { slug: { in: legacyPackageSlugs } } });
  for (const [order, p] of packages.entries()) {
    // Prices aren't on the client's site: "Price on request" until confirmed.
    const data = { ...p, highlighted: false, startingPrice: null, order, published: true };
    await prisma.package.upsert({
      where: { slug: p.slug },
      create: data,
      update: refreshes("packages") ? data : {},
    });
  }
  console.log(`✓ ${packages.length} packages`);

  if (refreshes("packages")) await prisma.packageComparisonRow.deleteMany();
  if ((await prisma.packageComparisonRow.count()) === 0) {
    await prisma.packageComparisonRow.createMany({
      data: comparison.map(([label, values], order) => ({ label, values, order })),
    });
    console.log("✓ Package comparison");
  }

  if (refreshes("addons"))
    await prisma.addOn.deleteMany({ where: { name: { in: legacyAddOnNames } } });
  if (refreshes("addons") || (await prisma.addOn.count()) === 0) {
    for (const [order, [name, description, slug]] of addOns.entries()) {
      const data = { description, serviceId: slug ? serviceIds[slug] : null, order };
      const existing = await prisma.addOn.findFirst({ where: { name } });
      if (!existing) await prisma.addOn.create({ data: { name, ...data } });
      else if (refreshes("addons")) await prisma.addOn.update({ where: { id: existing.id }, data });
    }
    console.log("✓ Add-ons");
  }

  if (refreshes("reviews"))
    await prisma.review.deleteMany({ where: { author: { startsWith: "[PLACEHOLDER]" } } });
  if (refreshes("reviews") || (await prisma.review.count()) === 0) {
    for (const [order, r] of reviews.entries()) {
      if (await prisma.review.findFirst({ where: { author: r.author, text: r.text } })) continue;
      await prisma.review.create({
        data: { ...r, rating: 5, source: ReviewSource.GOOGLE, order },
      });
    }
    console.log(`✓ ${reviews.length} Google reviews`);
  }

  if (refreshes("gallery")) {
    await prisma.galleryItem.deleteMany({ where: { media: { key: { startsWith: "sample/" } } } });
  }
  if (refreshes("gallery") || (await prisma.galleryItem.count()) === 0) {
    for (const [order, [name, category, slug]] of gallery.entries()) {
      const media = await photo(name);
      const data = { category, serviceId: slug ? serviceIds[slug] : null, order };
      const existing = await prisma.galleryItem.findFirst({ where: { mediaId: media.id } });
      if (!existing) {
        await prisma.galleryItem.create({
          data: { type: GalleryType.IMAGE, mediaId: media.id, ...data },
        });
      } else if (refreshes("gallery")) {
        // Re-link seeded photos to their (possibly new) service pages.
        await prisma.galleryItem.update({ where: { id: existing.id }, data });
      }
    }
    for (const [i, [youtubeId, caption]] of videos.entries()) {
      if (await prisma.galleryItem.findFirst({ where: { youtubeId } })) continue;
      await prisma.galleryItem.create({
        data: {
          type: GalleryType.VIDEO,
          category: GalleryCategory.VIDEO,
          youtubeId,
          caption,
          order: gallery.length + i,
        },
      });
    }
    console.log(`✓ ${gallery.length} gallery photos + ${videos.length} videos`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
