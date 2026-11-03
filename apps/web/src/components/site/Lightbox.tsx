"use client";

import type { GalleryImage } from "@taj/types";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { SmartImage } from "@/components/ui/SmartImage";
import { useGalleryStore } from "@/stores/gallery-store";

/** Modal image viewer: arrow keys, swipe, ESC to close (native <dialog>). */
export function Lightbox({ images }: { images: GalleryImage[] }) {
  const index = useGalleryStore((s) => s.lightboxIndex);
  const close = useGalleryStore((s) => s.closeLightbox);
  const step = useGalleryStore((s) => s.step);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const swipeStart = useRef<number | null>(null);
  const item = index === null ? null : images[index];

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (item && !d.open) d.showModal();
    if (!item && d.open) d.close();
  }, [item]);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1, images.length);
      if (e.key === "ArrowLeft") step(-1, images.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [item, step, images.length]);

  const navBtn =
    "absolute top-1/2 flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-gold-300/60 bg-cocoa-900/70 text-gold-300 hover:bg-cocoa-900";

  return (
    <dialog
      ref={dialogRef}
      aria-label="Photo viewer"
      onClose={close}
      onClick={(e) => e.target === e.currentTarget && close()}
      onPointerDown={(e) => (swipeStart.current = e.clientX)}
      onPointerUp={(e) => {
        if (swipeStart.current === null) return;
        const dx = e.clientX - swipeStart.current;
        swipeStart.current = null;
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1, images.length);
      }}
      className="m-auto h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-cocoa-950/90"
    >
      {item && (
        <div className="relative flex h-full w-full items-center justify-center p-4 sm:p-12">
          <div className="relative h-full w-full max-w-5xl">
            <SmartImage
              src={item.image.url}
              alt={item.image.alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          <p className="absolute bottom-4 left-1/2 m-0 -translate-x-1/2 rounded-full bg-cocoa-900/80 px-4 py-1.5 text-sm text-sand-200">
            {(index ?? 0) + 1} / {images.length}
          </p>
          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={() => step(-1, images.length)}
                className={`${navBtn} left-3`}
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={() => step(1, images.length)}
                className={`${navBtn} right-3`}
              >
                <ChevronRight aria-hidden="true" />
              </button>
            </>
          )}
          <button
            type="button"
            aria-label="Close"
            autoFocus
            onClick={close}
            className="absolute top-3 right-3 flex size-12 cursor-pointer items-center justify-center rounded-full border border-gold-300/60 bg-cocoa-900/70 text-gold-300"
          >
            <X aria-hidden="true" />
          </button>
        </div>
      )}
    </dialog>
  );
}
