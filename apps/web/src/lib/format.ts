import type { OpeningHours } from "@taj/types";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(amount: number): string {
  return inr.format(amount);
}

/** "Starting from ₹X" when priced, otherwise "Price on request". */
export function formatStartingPrice(amount: number | null): string {
  return amount === null ? "Price on request" : formatINR(amount);
}

function formatTime(hhmm: string): string {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour} ${suffix}` : `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** e.g. "Open daily, 9 am – 10 pm" or "Mon, Tue: 10 am – 6 pm". */
export function formatHours({ days, opens, closes }: OpeningHours): string {
  const label = days.length === 7 ? "Open daily" : days.map((d) => d.slice(0, 3)).join(", ");
  return `${label}, ${formatTime(opens)} – ${formatTime(closes)}`;
}

export function formatAddress(parts: {
  addressLine: string;
  city: string;
  postalCode: string | null;
}): string {
  return [parts.addressLine, parts.postalCode ? `${parts.city} ${parts.postalCode}` : parts.city]
    .filter(Boolean)
    .join(", ");
}

export function formatCount(n: number): string {
  return n.toLocaleString("en-IN");
}

/** Splits admin-entered text into paragraphs on blank lines. */
export function toParagraphs(text: string | null): string[] {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
