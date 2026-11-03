"use client";

import type { GalleryCategory, GalleryImage } from "@taj/types";
import { useEffect, useMemo } from "react";

import { SmartImage } from "@/components/ui/SmartImage";
import { cn } from "@/lib/cn";
import { bentoPattern, categoryFromSlug, galleryCategoryMeta } from "@/lib/gallery";
import { type GalleryFilter, useGalleryStore } from "@/stores/gallery-store";

import { Lightbox } from "./Lightbox";

const spanClass = { 1: "", 2: "col-span-2" } as const;
const rowClass = { 1: "", 2: "row-span-2" } as const;

/** Filter chips + dense bento grid + lightbox. Filter is mirrored in ?category= for sharing. */
export function GalleryBento({ images }: { images: GalleryImage[] }) {
  const filter = useGalleryStore((s) => s.filter);
  const setFilter = useGalleryStore((s) => s.setFilter);
  const openLightbox = useGalleryStore((s) => s.openLightbox);

  // URL → store on first load (shared links).
  useEffect(() => {
    const fromUrl = categoryFromSlug(new URLSearchParams(window.location.search).get("category"));
    setFilter(fromUrl ?? "ALL");
  }, [setFilter]);

  const choose = (next: GalleryFilter) => {
    setFilter(next);
    const url = new URL(window.location.href);
    if (next === "ALL") url.searchParams.delete("category");
    else url.searchParams.set("category", galleryCategoryMeta[next].slug);
    window.history.replaceState(null, "", url);
  };

  const present = useMemo(() => new Set(images.map((i) => i.category)), [images]);
  const tabs: GalleryFilter[] = [
    "ALL",
    ...(Object.keys(galleryCategoryMeta) as GalleryCategory[]).filter((c) => present.has(c)),
  ];
  const visible = filter === "ALL" ? images : images.filter((i) => i.category === filter);

  return (
    <>
      <div role="group" aria-label="Filter photos" className="flex gap-2 overflow-x-auto pt-2 pb-1">
        {tabs.map((t) => {
          const on = filter === t;
          return (
            <button
              key={t}
              type="button"
              aria-pressed={on}
              onClick={() => choose(t)}
              className={cn(
                "min-h-11 shrink-0 cursor-pointer rounded-full border border-gold-500 px-[18px] text-sm font-semibold transition-colors",
                on
                  ? "bg-cocoa-900 text-cream-50"
                  : "bg-transparent text-cocoa-900 hover:bg-gold-500/10",
              )}
            >
              {t === "ALL" ? "All" : galleryCategoryMeta[t as GalleryCategory].label}
            </button>
          );
        })}
      </div>

      {/* Re-keyed per filter so the pop-in animation replays. */}
      <ul
        key={filter}
        className="m-0 mt-6 grid list-none auto-rows-[clamp(140px,20vw,240px)] grid-flow-dense grid-cols-2 gap-3 p-0 gal:grid-cols-4"
      >
        {visible.map((item, i) => {
          const [cs, rs] = bentoPattern[i % bentoPattern.length] ?? [1, 1];
          return (
            <li
              key={item.id}
              className={cn("relative animate-pop", spanClass[cs], rowClass[rs])}
              style={{ animationDelay: `${Math.min(i, 10) * 70}ms` }}
            >
              <button
                type="button"
                onClick={() => openLightbox(i)}
                aria-label={`View larger: ${item.image.alt}`}
                className="group absolute inset-0 cursor-zoom-in overflow-hidden rounded-[14px] bg-cocoa-800"
              >
                <SmartImage
                  src={item.image.url}
                  alt={item.image.alt}
                  fill
                  sizes={
                    cs === 2 ? "(min-width: 700px) 600px, 100vw" : "(min-width: 700px) 300px, 50vw"
                  }
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
            </li>
          );
        })}
      </ul>

      <Lightbox images={visible} />
    </>
  );
}
