import type { ImageLoader, ImageProps } from "next/image";

import variants from "./photo-variants.json";

const widths = variants.widths;
const largest = widths[widths.length - 1]!;
const photoPattern = /\.(jpe?g|png|webp)$/i;

/**
 * Bundled photos (/photos/x.jpg): WebP copies pre-built by `scripts/photo-variants.mjs`
 * (/photos-opt/x-<width>.webp), so the server never resizes them on request.
 */
const photoLoader: ImageLoader = ({ src, width }) => {
  const size = widths.find((w) => w >= width) ?? largest;
  const base = src.slice(variants.sourceDir.length).replace(photoPattern, "");
  return `${variants.outputDir}${base}-${size}.webp`;
};

/** Unsplash images: resized and converted by Unsplash's own image CDN. */
const unsplashLoader: ImageLoader = ({ src, width, quality }) => {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? variants.quality));
  url.searchParams.set("auto", "format");
  return url.toString();
};

/**
 * Picks a loader that avoids on-demand optimisation on our own server. Anything else
 * (uploads, YouTube posters, static imports) keeps Next's built-in optimiser.
 * Photo variants only exist in production builds, so dev keeps the default loader.
 */
export function loaderFor(src: ImageProps["src"]): ImageLoader | undefined {
  if (typeof src !== "string") return undefined;
  if (src.startsWith("https://images.unsplash.com/")) return unsplashLoader;
  if (
    process.env.NODE_ENV === "production" &&
    src.startsWith(variants.sourceDir) &&
    photoPattern.test(src)
  ) {
    return photoLoader;
  }
  return undefined;
}
