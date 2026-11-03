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
      <div className="grid auto-rows-[clamp(150px,18vw,210px)] grid-cols-[repeat(auto-fill,minmax(min(100%,160px),1fr))] gap-3">
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
              sizes={i === 0 ? "(min-width: 700px) 480px, 100vw" : "(min-width: 700px) 240px, 50vw"}
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
