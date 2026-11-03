import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "@/lib/cn";

type Props<T extends ElementType> = {
  as?: T;
  /** "wide" (1440px) is for content that needs room, e.g. the package comparison table. */
  width?: "default" | "narrow" | "wide";
} & ComponentPropsWithoutRef<T>;

/** Centered content column with the design's fluid side padding. */
export function Container<T extends ElementType = "div">({
  as,
  width = "default",
  className,
  ...rest
}: Props<T>) {
  const Tag: ElementType = as ?? "div";
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-[clamp(16px,4vw,32px)]",
        { narrow: "max-w-[900px]", default: "max-w-[1200px]", wide: "max-w-[1440px]" }[width],
        className,
      )}
      {...rest}
    />
  );
}
