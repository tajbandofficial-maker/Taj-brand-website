import type { Review } from "@taj/types";

import { Stars } from "@/components/ui/Stars";
import { cn } from "@/lib/cn";

const sourceLabel = { GOOGLE: "Google", DIRECT: null, HIGH_PROFILE: null } as const;

type Props = {
  review: Review;
  /** "cream" sits on sand sections (home); "white" on cream sections (/reviews). */
  surface?: "cream" | "white";
  showSource?: boolean;
  className?: string;
};

export function ReviewCard({ review, surface = "cream", showSource = false, className }: Props) {
  const source = showSource ? sourceLabel[review.source] : null;
  return (
    <figure
      className={cn(
        "m-0 flex flex-col gap-4 rounded-2xl",
        surface === "cream" ? "bg-cream-50 p-6" : "border border-line bg-white p-[22px]",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <Stars rating={review.rating} className="tracking-[2px] text-gold-600" />
        {source && <span className="text-xs text-ink-muted">{source}</span>}
      </div>
      <blockquote className="m-0 flex-1 text-base leading-relaxed text-ink">
        “{review.text}”
      </blockquote>
      <figcaption className="flex flex-col gap-0.5">
        <span className="text-[15px] font-bold">{review.author}</span>
        {review.meta && <span className="text-[13px] text-ink-muted">{review.meta}</span>}
      </figcaption>
    </figure>
  );
}
