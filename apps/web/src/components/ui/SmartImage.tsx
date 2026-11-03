"use client";

import Image, { type ImageProps } from "next/image";

import { loaderFor } from "@/lib/images/loaders";

/**
 * next/image with a loader chosen from the src: pre-built WebP for bundled photos and
 * Unsplash's CDN for Unsplash images (see lib/images/loaders.ts). A client component
 * because loader functions can't be passed from Server Components.
 */
export function SmartImage({ alt, loader, ...props }: ImageProps) {
  return <Image alt={alt} loader={loader ?? loaderFor(props.src)} {...props} />;
}
