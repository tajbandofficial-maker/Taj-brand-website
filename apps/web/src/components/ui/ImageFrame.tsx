import type { ImageAsset } from "@taj/types";
import Image from "next/image";

import { cn } from "@/lib/cn";

type Props = {
  image: ImageAsset | null;
  /** Accurate `sizes` for responsive srcset — required for performance. */
  sizes: string;
  priority?: boolean;
  /** Wrapper classes: aspect ratio / size, radius, shadow. */
  className?: string;
  imageClassName?: string;
  /** Shown when no image has been uploaded yet. */
  placeholder?: string;
};

/** Cropped, rounded image box (next/image `fill`) with an on-brand empty state. */
export function ImageFrame({
  image,
  sizes,
  priority = false,
  className,
  imageClassName,
  placeholder = "Photo coming soon",
}: Props) {
  return (
    <div className={cn("relative overflow-hidden bg-cocoa-800", className)}>
      {image ? (
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          fetchPriority={priority ? "high" : undefined}
          className={cn("object-cover", imageClassName)}
        />
      ) : (
        <div className="dot-grid absolute inset-0 flex items-center justify-center p-4 text-center text-sm font-semibold text-sand-400">
          {placeholder}
        </div>
      )}
    </div>
  );
}
