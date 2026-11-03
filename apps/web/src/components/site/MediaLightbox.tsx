"use client";

import type { ImageAsset } from "@taj/types";
import { ChevronLeft, ChevronRight, Pause, Play, X, ZoomIn, ZoomOut } from "lucide-react";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";

import { SmartImage } from "@/components/ui/SmartImage";
import { cn } from "@/lib/cn";

export type MediaItem =
  | {
      kind: "image";
      id: string;
      image: ImageAsset;
      caption?: string | null;
      /** Small chip next to the caption, e.g. the gallery category. */
      label?: string;
    }
  | {
      kind: "video";
      id: string;
      title: string;
      /** null until the client adds the YouTube link — shown as "coming soon". */
      youtubeId: string | null;
      poster: ImageAsset;
      label?: string;
    };

type Props = {
  items: MediaItem[];
  /** Open item, or null when closed. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  /** Eyebrow in the top bar. */
  title?: string;
};

type Direction = "open" | "next" | "prev";

const SLIDE_MS = 5000;
const ZOOM = 2.2;

const posterOf = (item: MediaItem) => (item.kind === "image" ? item.image : item.poster);
const captionOf = (item: MediaItem) =>
  item.kind === "image" ? item.caption || item.image.alt : item.title;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Full-screen viewer for photos and videos: blurred ambient backdrop, gold-framed stage
 * with direction-aware transitions, tap-to-zoom, slideshow, filmstrip, swipe and keys.
 */
export function MediaLightbox({ items, index, onIndexChange, onClose, title = "Taj Band" }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stripRef = useRef<HTMLUListElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const [direction, setDirection] = useState<Direction>("open");
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [ratios, setRatios] = useState<Record<string, number>>({});

  const count = items.length;
  const open = index !== null && index < count;
  const current = open ? items[index] : undefined;

  const go = useCallback(
    (delta: 1 | -1) => {
      if (index === null || count < 2) return;
      setDirection(delta > 0 ? "next" : "prev");
      setZoom(null);
      onIndexChange((index + delta + count) % count);
    },
    [index, count, onIndexChange],
  );

  const jump = (target: number) => {
    if (index === null || target === index) return;
    setDirection(target > index ? "next" : "prev");
    setZoom(null);
    onIndexChange(target);
  };

  const close = useCallback(() => {
    setPlaying(false);
    setZoom(null);
    setDirection("open");
    onClose();
  }, [onClose]);

  // Native <dialog>: focus trap, Esc, top layer.
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      closeRef.current?.focus(); // otherwise the dialog focuses its first button
    }
    if (!open && d.open) d.close();
  }, [open]);

  // Keep the page behind from scrolling while open.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Home" || e.key === "End") {
        const target = e.key === "Home" ? 0 : count - 1;
        if (index === null || target === index) return;
        setDirection(target > index ? "next" : "prev");
        setZoom(null);
        onIndexChange(target);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, go, index, count, onIndexChange]);

  // Slideshow: advances photos only; it waits on a video until the visitor moves on.
  const isVideo = current?.kind === "video";
  useEffect(() => {
    if (!playing || !open || isVideo || zoom) return;
    const timer = window.setTimeout(() => go(1), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [playing, open, isVideo, zoom, index, go]);

  // Keep the active thumbnail in view.
  useEffect(() => {
    if (!open) return;
    const thumb = stripRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`);
    thumb?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [open, index]);

  const onSwipeStart = (e: React.PointerEvent) => {
    if (zoom) return;
    swipeStart.current = { x: e.clientX, y: e.clientY };
  };
  const onSwipeEnd = (e: React.PointerEvent) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || zoom) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) close(); // swipe down to close
  };

  /** Pointer position as % of the (unzoomed) frame, measured right away (React reuses events). */
  const pointAt = (e: React.PointerEvent | React.MouseEvent) => {
    const frame = e.currentTarget.parentElement ?? e.currentTarget;
    const box = frame.getBoundingClientRect();
    return {
      x: Math.min(100, Math.max(0, ((e.clientX - box.left) / box.width) * 100)),
      y: Math.min(100, Math.max(0, ((e.clientY - box.top) / box.height) * 100)),
    };
  };

  const ratio =
    current?.kind === "video"
      ? 16 / 9
      : current
        ? (ratios[current.id] ??
          (current.image.width && current.image.height
            ? current.image.width / current.image.height
            : 3 / 2))
        : 3 / 2;

  const prevItem = open && count > 1 ? items[(index - 1 + count) % count] : undefined;
  const nextItem = open && count > 1 ? items[(index + 1) % count] : undefined;

  const glassBtn =
    "flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gold-300/40 bg-cocoa-900/60 text-gold-300 backdrop-blur-md transition-all hover:scale-105 hover:border-gold-300 hover:bg-cocoa-800/80 disabled:cursor-default disabled:opacity-40";

  return (
    <dialog
      ref={dialogRef}
      aria-label={`${title} viewer`}
      onClose={close}
      className="m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-cream-50 backdrop:bg-cocoa-950/95"
    >
      {current && index !== null && (
        <div className="relative isolate grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto_auto] bg-cocoa-950/80">
          {/* Ambient glow: the current picture, blurred behind everything. */}
          <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
            <div key={current.id} className="absolute inset-0 animate-lb-fade">
              <SmartImage
                src={posterOf(current).url}
                alt=""
                fill
                sizes="128px"
                className="scale-125 object-cover opacity-45 blur-3xl saturate-150"
              />
            </div>
            <div className="dot-grid absolute inset-0 opacity-60" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgb(20_6_4/0.85)_100%)]" />
          </div>

          {/* Slideshow progress */}
          {playing && !isVideo && !zoom && (
            <div
              key={`progress-${index}`}
              aria-hidden="true"
              style={{ "--lb-slide": `${SLIDE_MS}ms` } as CSSProperties}
              className="absolute inset-x-0 top-0 z-10 h-[3px] origin-left animate-lb-progress bg-gradient-to-r from-gold-500 via-gold-300 to-sun-400 shadow-[0_0_12px_rgb(232_196_104/0.8)]"
            />
          )}

          {/* Top bar */}
          <header className="flex items-center justify-between gap-4 px-4 pt-4 sm:px-8 sm:pt-6">
            <div className="flex min-w-0 flex-col">
              <span className="text-[11px] font-bold tracking-[0.22em] text-gold-300/80 uppercase">
                {title}
              </span>
              <p aria-live="polite" className="m-0 flex items-baseline gap-1.5 font-serif">
                <span className="text-3xl text-gold-300 sm:text-4xl">{pad(index + 1)}</span>
                <span className="text-lg text-sand-400">/ {pad(count)}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {count > 1 && !isVideo && (
                <button
                  type="button"
                  aria-label={playing ? "Pause slideshow" : "Play slideshow"}
                  aria-pressed={playing}
                  onClick={() => setPlaying((p) => !p)}
                  className={glassBtn}
                >
                  {playing ? (
                    <Pause aria-hidden="true" className="size-5" />
                  ) : (
                    <Play aria-hidden="true" className="size-5 translate-x-px" />
                  )}
                </button>
              )}
              {!isVideo && (
                <button
                  type="button"
                  aria-label={zoom ? "Zoom out" : "Zoom in"}
                  aria-pressed={Boolean(zoom)}
                  onClick={() => setZoom((z) => (z ? null : { x: 50, y: 50 }))}
                  className={glassBtn}
                >
                  {zoom ? (
                    <ZoomOut aria-hidden="true" className="size-5" />
                  ) : (
                    <ZoomIn aria-hidden="true" className="size-5" />
                  )}
                </button>
              )}
              <button
                type="button"
                ref={closeRef}
                aria-label="Close"
                onClick={close}
                className={cn(glassBtn, "hover:rotate-90")}
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
          </header>

          {/* Stage */}
          <div
            className="relative flex min-h-0 items-center justify-center px-3 py-4 sm:px-20 sm:py-6"
            onPointerDown={onSwipeStart}
            onPointerUp={onSwipeEnd}
            onClick={(e) => e.target === e.currentTarget && close()}
          >
            <div
              className="flex size-full items-center justify-center [container-type:size]"
              onClick={(e) => e.target === e.currentTarget && close()}
            >
              <div
                key={current.id}
                style={{ width: `min(100cqw, calc(100cqh * ${ratio}))`, aspectRatio: ratio }}
                className={cn(
                  "relative max-h-full",
                  direction === "next" && "animate-lb-next",
                  direction === "prev" && "animate-lb-prev",
                  direction === "open" && "animate-lb-open",
                )}
              >
                {/* Gold corner ornaments */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-2 -left-2 z-10 size-7 rounded-tl-xl border-t-2 border-l-2 border-gold-300/80 sm:-top-3 sm:-left-3 sm:size-10"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-2 -right-2 z-10 size-7 rounded-tr-xl border-t-2 border-r-2 border-gold-300/80 sm:-top-3 sm:-right-3 sm:size-10"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-2 -left-2 z-10 size-7 rounded-bl-xl border-b-2 border-l-2 border-gold-300/80 sm:-bottom-3 sm:-left-3 sm:size-10"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 -bottom-2 z-10 size-7 rounded-br-xl border-r-2 border-b-2 border-gold-300/80 sm:-right-3 sm:-bottom-3 sm:size-10"
                />

                <div className="absolute inset-0 overflow-hidden rounded-[14px] bg-cocoa-900 shadow-[0_40px_120px_rgb(0_0_0/0.65),0_0_0_1px_rgb(232_196_104/0.25)]">
                  {current.kind === "image" ? (
                    <div
                      role="presentation"
                      onClick={(e) => {
                        const point = pointAt(e);
                        setZoom((z) => (z ? null : point));
                      }}
                      onPointerMove={(e) => {
                        if (zoom) setZoom(pointAt(e));
                      }}
                      style={{
                        transform: zoom ? `scale(${ZOOM})` : "scale(1)",
                        transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "50% 50%",
                      }}
                      className={cn(
                        "absolute inset-0 transition-transform duration-500 ease-out",
                        zoom ? "cursor-zoom-out touch-none" : "cursor-zoom-in",
                      )}
                    >
                      <SmartImage
                        src={current.image.url}
                        alt={current.image.alt}
                        fill
                        priority
                        sizes="(min-width: 1024px) 85vw, 100vw"
                        onLoad={(e) => {
                          const img = e.currentTarget;
                          if (!img.naturalWidth || ratios[current.id]) return;
                          const r = img.naturalWidth / img.naturalHeight;
                          setRatios((all) => ({ ...all, [current.id]: r }));
                        }}
                        className="object-cover select-none"
                        draggable={false}
                      />
                    </div>
                  ) : current.youtubeId ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${current.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                      title={current.title}
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      className="absolute inset-0 size-full border-0"
                    />
                  ) : (
                    <>
                      <SmartImage
                        src={current.poster.url}
                        alt={current.poster.alt}
                        fill
                        sizes="(min-width: 1024px) 85vw, 100vw"
                        className="object-cover opacity-60"
                      />
                      <span className="absolute inset-0 flex items-center justify-center font-serif text-2xl text-gold-300">
                        Video coming soon
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {count > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous"
                  onClick={() => go(-1)}
                  className={cn(
                    glassBtn,
                    "absolute top-1/2 left-2 -translate-y-1/2 sm:left-5 sm:size-13",
                  )}
                >
                  <ChevronLeft aria-hidden="true" className="size-6" />
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  onClick={() => go(1)}
                  className={cn(
                    glassBtn,
                    "absolute top-1/2 right-2 -translate-y-1/2 sm:right-5 sm:size-13",
                  )}
                >
                  <ChevronRight aria-hidden="true" className="size-6" />
                </button>
              </>
            )}

            {/* Warm the neighbours so stepping feels instant. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute size-px overflow-hidden opacity-0"
            >
              {[prevItem, nextItem].map((n) =>
                n && n.kind === "image" ? (
                  <SmartImage
                    key={n.id}
                    src={n.image.url}
                    alt=""
                    width={16}
                    height={16}
                    loading="eager"
                    sizes="(min-width: 1024px) 85vw, 100vw"
                  />
                ) : null,
              )}
            </div>
          </div>

          {/* Caption */}
          <div
            key={`caption-${current.id}`}
            className="flex animate-lb-fade flex-wrap items-center justify-center gap-x-3 gap-y-1 px-6 pb-3 text-center"
          >
            {(current.label ?? (current.kind === "video" ? "Video" : undefined)) && (
              <span className="rounded-full border border-gold-300/50 px-3 py-0.5 text-[11px] font-bold tracking-[0.16em] text-gold-300 uppercase">
                {current.label ?? "Video"}
              </span>
            )}
            <p className="m-0 max-w-2xl font-serif text-lg text-sand-200 italic sm:text-xl">
              {captionOf(current)}
            </p>
          </div>

          {/* Filmstrip */}
          {count > 1 ? (
            <nav aria-label="All items" className="px-3 pb-4 sm:px-8 sm:pb-6">
              <ul
                ref={stripRef}
                className="m-0 mx-auto flex w-fit max-w-full list-none snap-x gap-2 overflow-x-auto px-1 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {items.map((item, i) => {
                  const active = i === index;
                  return (
                    <li key={item.id} className="shrink-0 snap-center">
                      <button
                        type="button"
                        data-index={i}
                        aria-label={`Show ${i + 1}: ${captionOf(item)}`}
                        aria-current={active ? "true" : undefined}
                        onClick={() => jump(i)}
                        className={cn(
                          "relative block size-14 cursor-pointer overflow-hidden rounded-lg transition-all duration-300 sm:size-16",
                          active
                            ? "scale-105 opacity-100 ring-2 ring-gold-300 ring-offset-2 ring-offset-cocoa-950"
                            : "opacity-45 grayscale-[40%] hover:opacity-90 hover:grayscale-0",
                        )}
                      >
                        <SmartImage
                          src={posterOf(item).url}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                        {item.kind === "video" && (
                          <span className="absolute inset-0 flex items-center justify-center bg-cocoa-950/35">
                            <Play
                              aria-hidden="true"
                              className="size-4 fill-gold-300 text-gold-300"
                            />
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ) : (
            <div className="pb-4 sm:pb-6" />
          )}
        </div>
      )}
    </dialog>
  );
}
