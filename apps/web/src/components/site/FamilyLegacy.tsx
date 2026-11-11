import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { SmartImage } from "@/components/ui/SmartImage";
import { cn } from "@/lib/cn";

import { Reveal } from "./Reveal";

export type Generation = { role: string; name: string; text: string };

export type LegacyPhoto = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
};

const numerals = ["I", "II", "III", "IV", "V", "VI"];

/**
 * The old band photo as an archive print: cream paper border, warm sepia tone, a second print
 * peeking out behind, and a gold "Est." seal. Straightens and lifts on hover.
 */
function ArchivePhoto({ photo, since }: { photo: LegacyPhoto; since: number | null }) {
  return (
    <Reveal className="mx-auto w-full max-w-[560px] px-3 lg:mx-0">
      <figure className="group/photo relative m-0">
        {/* Second print behind, for depth. */}
        <span
          aria-hidden="true"
          className="absolute inset-0 translate-x-3 translate-y-2 rotate-[3.5deg] rounded-[6px] bg-cream-100/90 shadow-[0_20px_50px_rgb(0_0_0/0.45)] transition-transform duration-700 group-hover/photo:rotate-[5deg]"
        />
        <div className="relative -rotate-[2deg] rounded-[6px] bg-cream-50 p-[clamp(10px,1.6vw,16px)] pb-[clamp(44px,6vw,58px)] shadow-[0_30px_70px_rgb(0_0_0/0.55)] transition-transform duration-700 ease-out group-hover/photo:-translate-y-1 group-hover/photo:rotate-0">
          <div className="relative overflow-hidden rounded-[2px]">
            <SmartImage
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(min-width: 1024px) 540px, 92vw"
              className="block h-auto w-full contrast-[1.05] sepia-[0.35] transition-[filter] duration-700 group-hover/photo:sepia-[0.15]"
            />
            {/* Aged-print vignette. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_rgb(40_20_6/0.45)]"
            />
          </div>
          <figcaption className="absolute inset-x-0 bottom-0 flex h-[clamp(44px,6vw,58px)] items-center justify-center px-4 text-center font-serif text-[clamp(15px,1.6vw,18px)] text-cocoa-900 italic">
            {photo.caption}
          </figcaption>
        </div>

        {/* Gold seal over the corner. */}
        {since && (
          <span
            aria-hidden="true"
            className="absolute -top-5 -right-1 flex size-[clamp(72px,9vw,92px)] rotate-[10deg] flex-col items-center justify-center rounded-full bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 text-cocoa-900 shadow-[0_10px_30px_rgb(0_0_0/0.45),inset_0_0_0_3px_rgb(255_255_255/0.25)] transition-transform duration-700 group-hover/photo:rotate-0 sm:-right-4"
          >
            <span className="absolute inset-[5px] rounded-full border border-dashed border-cocoa-900/40" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Est.</span>
            <span className="font-serif text-[clamp(20px,2.4vw,24px)] leading-none">{since}</span>
          </span>
        )}
      </figure>
    </Reveal>
  );
}

/**
 * "Four generations" family timeline: gold medallions strung on a line that draws itself in
 * (vertical on phones, horizontal from lg), with the present-day owners highlighted last.
 */
export function FamilyLegacy({
  eyebrow,
  title,
  accent,
  text,
  generations,
  since,
  photo,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  text: string;
  generations: Generation[];
  /** Founded year — drawn as a large outlined watermark. */
  since: number | null;
  /** Old band photo shown as a framed archive print beside the heading. */
  photo?: LegacyPhoto;
}) {
  const list = generations.filter((g) => g.name.trim());
  if (list.length === 0) return null;
  const last = list.length - 1;

  return (
    <Section tone="dark" className="relative isolate overflow-hidden">
      {/* Backdrop: warm glow + outlined founding-year watermark. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 size-[720px] -translate-x-1/2 rounded-full bg-gold-500/10 blur-[120px]" />
        {since && (
          <span className="absolute right-[-0.06em] bottom-[-0.22em] font-serif text-[clamp(160px,30vw,380px)] leading-none text-transparent [-webkit-text-stroke:1px_rgb(232_196_104/0.12)] select-none">
            {since}
          </span>
        )}
      </div>

      <div
        className={cn(
          "mb-[clamp(40px,6vw,72px)]",
          photo
            ? "grid items-center gap-[clamp(36px,6vw,72px)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
            : "mx-auto max-w-[720px]",
        )}
      >
        {photo && <ArchivePhoto photo={photo} since={since} />}
        <div
          className={cn(
            "flex flex-col gap-3",
            photo
              ? "items-center text-center lg:items-start lg:text-left"
              : "items-center text-center",
          )}
        >
          <Eyebrow tone="dark">{eyebrow}</Eyebrow>
          <h2 className="m-0 text-section text-cream-50">
            {title} <em className="text-gold-shine animate-shine pr-[0.08em]">{accent}</em>
          </h2>
          <p className="m-0 max-w-[560px] text-lead text-sand-200">{text}</p>
        </div>
      </div>

      <Reveal className="group/legacy">
        <ol
          className={cn(
            "relative m-0 grid list-none gap-8 p-0",
            list.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
            "lg:gap-6",
          )}
        >
          {/* The thread joining the generations. */}
          <span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[27px] w-px origin-top bg-gradient-to-b from-gold-300/10 via-gold-300/70 to-gold-300 group-data-[reveal=visible]/legacy:animate-draw-y lg:hidden"
          />
          <span
            aria-hidden="true"
            style={{ left: `${50 / list.length}%`, right: `${50 / list.length}%` }}
            className="absolute top-[27px] hidden h-px origin-left bg-gradient-to-r from-gold-300/10 via-gold-300/70 to-gold-300 group-data-[reveal=visible]/legacy:animate-draw-x lg:block"
          />

          {list.map((g, i) => {
            const today = i === last;
            return (
              <li
                key={i}
                className="relative grid grid-cols-[56px_minmax(0,1fr)] gap-x-5 group-data-[reveal=visible]/legacy:animate-rise lg:flex lg:flex-col lg:items-center lg:gap-5 lg:text-center"
                style={{ animationDelay: `${250 + i * 180}ms` }}
              >
                {/* Medallion */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative flex size-14 items-center justify-center rounded-full font-serif text-xl",
                    today
                      ? "bg-gradient-to-br from-gold-300 to-gold-500 text-cocoa-900 shadow-[0_0_0_6px_rgb(30_10_6),0_0_32px_rgb(232_196_104/0.55)]"
                      : "border border-gold-300/70 bg-cocoa-900 text-gold-300 shadow-[0_0_0_6px_rgb(30_10_6)]",
                  )}
                >
                  {today && (
                    <span className="absolute inset-0 animate-ping-ring rounded-full border-2 border-gold-300/60" />
                  )}
                  {numerals[i] ?? i + 1}
                </span>

                {/* Card */}
                <div
                  className={cn(
                    "flex min-w-0 flex-col gap-2 rounded-2xl border p-5 backdrop-blur-sm transition-colors duration-300 lg:w-full lg:flex-1",
                    today
                      ? "border-gold-300/70 bg-gradient-to-b from-gold-500/15 to-cocoa-800/60 shadow-[0_20px_60px_rgb(0_0_0/0.35)]"
                      : "border-gold-500/25 bg-cocoa-800/50 hover:border-gold-500/60",
                  )}
                >
                  <span className="text-[11px] font-bold tracking-[0.16em] text-gold-300 uppercase">
                    {g.role}
                  </span>
                  <span className="font-serif text-[clamp(22px,2.4vw,27px)] leading-tight text-cream-50">
                    {g.name}
                  </span>
                  {g.text && (
                    <p className="m-0 text-[15px] leading-relaxed text-sand-200">{g.text}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </Reveal>
    </Section>
  );
}
