import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

import { Container } from "./Container";

export type SectionTone = "cream" | "sand" | "dark";

const tones: Record<SectionTone, string> = {
  cream: "",
  sand: "bg-cream-100",
  dark: "bg-cocoa-900 text-cream-50",
};

const spacingClasses = {
  default: "py-[clamp(48px,7vw,96px)]",
  compact: "py-[clamp(48px,7vw,88px)]",
  "flush-top": "pt-0 pb-[clamp(48px,7vw,88px)]",
} as const;

type Props = ComponentPropsWithoutRef<"section"> & {
  tone?: SectionTone;
  width?: "default" | "narrow" | "wide";
  /** Vertical rhythm: "default" (home), "compact" (inner pages), "flush-top" after a related block. */
  spacing?: "default" | "compact" | "flush-top";
  containerClassName?: string;
};

/** Full-bleed background band with a centered, padded content column. */
export function Section({
  tone = "cream",
  width = "default",
  spacing = "default",
  className,
  containerClassName,
  children,
  ...rest
}: Props) {
  return (
    <section className={cn(tones[tone], className)} {...rest}>
      <Container width={width} className={cn(spacingClasses[spacing], containerClassName)}>
        {children}
      </Container>
    </section>
  );
}
