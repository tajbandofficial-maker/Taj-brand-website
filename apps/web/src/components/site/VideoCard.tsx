"use client";

import type { GalleryVideo } from "@taj/types";
import { Play } from "lucide-react";

import { SmartImage } from "@/components/ui/SmartImage";

/**
 * Video poster card. Tapping it opens the media lightbox (see VideoGallery), which loads the
 * privacy-enhanced YouTube player. Without a YouTube ID it renders as a still.
 */
export function VideoCard({ video, onOpen }: { video: GalleryVideo; onOpen: () => void }) {
  const playable = Boolean(video.youtubeId);

  const poster = (
    <>
      <SmartImage
        src={video.poster.url}
        alt={video.poster.alt}
        fill
        sizes="(min-width: 1000px) 380px, (min-width: 660px) 50vw, 100vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-cocoa-950/70 via-transparent to-transparent"
      />
      {playable && (
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-gold-300 bg-cocoa-900/70 text-gold-300 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110"
        >
          <span className="absolute inset-0 animate-ping-ring rounded-full border-2 border-gold-300/60" />
          <Play className="size-6 translate-x-0.5 fill-gold-300" />
        </span>
      )}
    </>
  );

  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative aspect-video overflow-hidden rounded-[14px] bg-cocoa-800">
        {playable ? (
          <button
            type="button"
            aria-label={`Play video: ${video.title}`}
            onClick={onOpen}
            className="group absolute inset-0 cursor-pointer"
          >
            {poster}
          </button>
        ) : (
          poster
        )}
      </div>
      <span className="text-[15px] font-semibold">{video.title}</span>
    </div>
  );
}
