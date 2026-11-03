import type { AdminMedia } from "@taj/types";
import { ImageOff } from "lucide-react";

/** Small square preview used in admin lists. */
export function Thumb({
  media,
  size = 48,
}: {
  media: AdminMedia | null | undefined;
  size?: number;
}) {
  if (!media) {
    return (
      <span
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded bg-cream-100 text-sand-400"
      >
        <ImageOff aria-hidden="true" className="size-4" />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
    <img
      src={media.url}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      style={{ width: size, height: size }}
      className="rounded object-cover"
    />
  );
}
