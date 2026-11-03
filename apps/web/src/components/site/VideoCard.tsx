"use client";

import type { GalleryVideo } from "@taj/types";
import { useState } from "react";

import { SmartImage } from "@/components/ui/SmartImage";

/**
 * YouTube facade: shows the poster until tapped, then loads the
 * privacy-enhanced iframe. Without a YouTube ID it renders as a still.
 */
export function VideoCard({ video }: { video: GalleryVideo }) {
  const [playing, setPlaying] = useState(false);
  const playable = Boolean(video.youtubeId);

  const poster = (
    <>
      <SmartImage
        src={video.poster.url}
        alt={video.poster.alt}
        fill
        sizes="(min-width: 1000px) 380px, (min-width: 660px) 50vw, 100vw"
        className="object-cover"
      />
      <span
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-gold-300 bg-cocoa-900/75 pl-1 text-[22px] text-gold-300"
      >
        ▶
      </span>
    </>
  );

  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative aspect-video overflow-hidden rounded-[14px] bg-cocoa-800">
        {playing && video.youtubeId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        ) : playable ? (
          <button
            type="button"
            aria-label={`Play video: ${video.title}`}
            onClick={() => setPlaying(true)}
            className="absolute inset-0 cursor-pointer"
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
