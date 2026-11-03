import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { toMapPins } from "@/lib/india-map";

import indiaMap from "../../../public/india-map.webp";

const HEART =
  "M12 21s-7.5-4.6-9.6-9.1C1 8.9 2.6 5.5 6 5.1c2-.2 3.4.8 4.2 2 .3.4.6.8.8 1.2.2-.4.5-.8.8-1.2.8-1.2 2.2-2.2 4.2-2 3.4.4 5 3.8 3.6 6.8C19.5 16.4 12 21 12 21z";

/**
 * "TBO around India": the 3D India map with a beating heart on each service
 * area (close cities are nudged apart so each stays visible). Tooltips are CSS-only — hover, tap or
 * keyboard focus — so the section ships no JavaScript.
 */
type Props = { areas: string[]; eyebrow: string; title: string };

export function JourneyMap({ areas, eyebrow, title }: Props) {
  if (areas.length === 0) return null;
  const pins = toMapPins(areas);

  return (
    <section className="relative overflow-hidden bg-cocoa-900 text-cream-50">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_65%_50%,rgb(200_149_46/0.38),rgb(138_75_18/0.18)_38%,transparent_70%)]"
      />
      <Container className="relative flex flex-wrap items-center gap-[clamp(24px,4vw,56px)] py-[clamp(48px,7vw,96px)]">
        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-6">
          <SectionHeader tone="dark" eyebrow={eyebrow} title={title} />
          <ul aria-label="Cities we play in" className="m-0 flex list-none flex-wrap gap-2 p-0">
            {areas.map((a) => (
              <li
                key={a}
                className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/50 px-3 py-1.5 text-sm font-semibold"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5 fill-gold-300">
                  <path d={HEART} />
                </svg>
                {a}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[620px] min-w-0 flex-[1_1_420px]">
          <Image
            src={indiaMap}
            alt="Map of India"
            fill
            sizes="(min-width: 860px) 620px, 100vw"
            className="object-contain drop-shadow-[0_30px_40px_rgb(0_0_0/0.35)]"
          />
          {pins.map((pin, i) => (
            <button
              key={pin.name}
              type="button"
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              className="group absolute z-[1] flex size-9 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full hover:z-[2] focus:z-[2]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                style={{ animationDelay: `${i * 220}ms` }}
                className="size-[clamp(18px,3vw,26px)] animate-heartbeat fill-cocoa-900 stroke-gold-500 stroke-[1.2] drop-shadow-[0_2px_3px_rgb(0_0_0/0.35)] group-hover:fill-gold-600 group-focus:fill-gold-600"
              >
                <path d={HEART} />
              </svg>
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-0.5 -translate-x-1/2 translate-y-1 rounded-lg bg-cream-50 px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-cocoa-900 opacity-0 shadow-[0_8px_24px_rgb(0_0_0/0.3)] transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100">
                {pin.name}
              </span>
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}
