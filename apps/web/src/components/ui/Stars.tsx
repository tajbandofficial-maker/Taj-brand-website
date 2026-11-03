import { cn } from "@/lib/cn";

type Props = {
  rating?: number;
  /** Staggered pop-in animation (reviews hero). */
  animated?: boolean;
  className?: string;
};

/** Five-star rating; the accessible label carries the value. */
export function Stars({ rating = 5, animated = false, className }: Props) {
  const full = Math.round(rating);
  return (
    <span
      role="img"
      aria-label={`${rating} out of 5 stars`}
      className={cn("inline-flex gap-0.5", className)}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn(i >= full && "opacity-30", animated && "animate-star")}
          style={animated ? { animationDelay: `${700 + i * 150}ms` } : undefined}
        >
          ★
        </span>
      ))}
    </span>
  );
}
