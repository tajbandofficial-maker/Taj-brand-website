"use client";

import type { GalleryVideo } from "@taj/types";
import { useMemo, useState } from "react";

import { type MediaItem, MediaLightbox } from "./MediaLightbox";
import { VideoCard } from "./VideoCard";

/** Video poster cards that open (and play) in the media lightbox, with next/previous between them. */
export function VideoGallery({
  videos,
  className,
}: {
  videos: GalleryVideo[];
  /** Grid/layout classes for the card list. */
  className?: string;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const items = useMemo<MediaItem[]>(
    () =>
      videos.map((v) => ({
        kind: "video",
        id: v.id,
        title: v.title,
        youtubeId: v.youtubeId,
        poster: v.poster,
      })),
    [videos],
  );

  return (
    <>
      <div className={className}>
        {videos.map((v, i) => (
          <VideoCard key={v.id} video={v} onOpen={() => setIndex(i)} />
        ))}
      </div>
      <MediaLightbox
        items={items}
        index={index}
        onIndexChange={setIndex}
        onClose={() => setIndex(null)}
        title="Taj Band · Videos"
      />
    </>
  );
}
