"use client";

import type { GalleryImage } from "@taj/types";
import { useMemo, useState } from "react";

import { ImageFrame } from "@/components/ui/ImageFrame";
import { cn } from "@/lib/cn";
import { galleryCategoryMeta } from "@/lib/gallery";

import { type MediaItem, MediaLightbox } from "./MediaLightbox";

/** Home-page photo teaser: tap any photo to browse them all in the media lightbox. */
export function GalleryPreview({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const items = useMemo<MediaItem[]>(
    () =>
      images.map((g) => ({
        kind: "image",
        id: g.id,
        image: g.image,
        caption: g.caption,
        label: galleryCategoryMeta[g.category].label,
      })),
    [images],
  );

  return (
    <>
      {/* Fixed 2 / 4 columns: the lead photo is 2×2 and the next four fill the rest exactly. */}
      <div className="grid auto-rows-[clamp(140px,20vw,240px)] grid-flow-dense grid-cols-2 gap-3 md:grid-cols-4">
        {images.map((g, i) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`View larger: ${g.image.alt}`}
            className={cn(
              "group relative cursor-zoom-in overflow-hidden rounded-[14px]",
              i === 0 && "col-span-2 row-span-2",
            )}
          >
            <ImageFrame
              image={g.image}
              sizes={i === 0 ? "(min-width: 768px) 640px, 100vw" : "(min-width: 768px) 320px, 50vw"}
              className="size-full"
              imageClassName="transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>
      <MediaLightbox
        items={items}
        index={index}
        onIndexChange={setIndex}
        onClose={() => setIndex(null)}
        title="Taj Band · Gallery"
      />
    </>
  );
}
