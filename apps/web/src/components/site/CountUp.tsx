"use client";

import { useEffect, useRef } from "react";

type Props = { to: number; decimals?: number; durationMs?: number; delayMs?: number };

/**
 * Counts up to `to` on mount. Server HTML already contains the final value, so
 * crawlers, no-JS and reduced-motion visitors see the real number.
 */
export function CountUp({ to, decimals = 0, durationMs = 1600, delayMs = 500 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (v: number) =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-IN");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const start = performance.now() + delayMs;
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - start) / durationMs));
      el.textContent = format(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    el.textContent = format(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- format is derived from props listed here
  }, [to, decimals, durationMs, delayMs]);

  return <span ref={ref}>{format(to)}</span>;
}
