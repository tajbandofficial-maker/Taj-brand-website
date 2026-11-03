/** Small helpers shared by admin forms. */

/** Optional text inputs hold "" — the API expects null to clear a value. */
export function blankToNull<T extends Record<string, unknown>>(values: T, keys: (keyof T)[]): T {
  const out = { ...values };
  for (const k of keys) {
    const v = out[k];
    if (typeof v === "string" && v.trim() === "") out[k] = null as T[keyof T];
    else if (typeof v === "string") out[k] = v.trim() as T[keyof T];
  }
  return out;
}

/** Number inputs hold strings; "" → null. */
export function toNumberOrNull(v: string | number | null | undefined): number | null {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** "Brass Band / Baraat" → "brass-band-baraat" */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, " ")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function required(value: string | null | undefined, label: string): string | undefined {
  return value && value.trim() ? undefined : `${label} is required`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function formatDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—";
}
