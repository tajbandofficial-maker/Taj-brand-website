import type { CSSProperties } from "react";

import { cn } from "@/lib/cn";

export type Glow = {
  /** Size + position classes, e.g. "size-[640px] -right-[200px] -top-[220px]". */
  className: string;
  /** Drift distance for the slow ambient movement. */
  drift?: [x: number, y: number];
  color?: "gold" | "sun";
};

/** Decorative layers behind dark heroes: drifting radial glows + dotted texture. */
export function HeroBackdrop({ glows, dots = true }: { glows: Glow[]; dots?: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {glows.map((g, i) => (
        <div
          key={i}
          className={cn("absolute animate-drift rounded-full", g.className)}
          style={
            {
              background:
                g.color === "sun"
                  ? "radial-gradient(circle, rgb(242 210 27 / 0.16), rgb(242 210 27 / 0) 65%)"
                  : "radial-gradient(circle, rgb(200 149 46 / 0.27), rgb(200 149 46 / 0) 65%)",
              "--drift-x": `${g.drift?.[0] ?? 120}px`,
              "--drift-y": `${g.drift?.[1] ?? 80}px`,
              animationDuration: `${11 + i * 2}s`,
            } as CSSProperties
          }
        />
      ))}
      {dots && <div className="dot-grid absolute inset-0" />}
    </div>
  );
}
