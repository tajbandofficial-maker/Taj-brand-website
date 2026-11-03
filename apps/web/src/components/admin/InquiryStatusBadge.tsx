import type { InquiryStatus } from "@taj/types";

import { Badge, type BadgeTone } from "./Badge";

export const inquiryStatusMeta: Record<InquiryStatus, { label: string; tone: BadgeTone }> = {
  NEW: { label: "New", tone: "gold" },
  CONTACTED: { label: "Contacted", tone: "info" },
  BOOKED: { label: "Booked", tone: "success" },
  LOST: { label: "Lost", tone: "neutral" },
  SPAM: { label: "Spam", tone: "danger" },
};

export function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  const m = inquiryStatusMeta[status];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
