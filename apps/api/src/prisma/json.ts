import type { Prisma } from "../generated/prisma/client.js";

/**
 * MySQL has no array columns, so string lists (inclusions, ticker, service areas,
 * inquiry services, comparison values) are stored as JSON arrays. Read them back
 * through this so a malformed value can never crash a page.
 */
export function toStringList(value: Prisma.JsonValue | undefined): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}
