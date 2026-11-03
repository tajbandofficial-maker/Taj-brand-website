"use client";

import type { AdminReview } from "@taj/types";

import { Badge, PublishedBadge } from "../Badge";
import { ListScreen } from "../ListScreen";
import { reviewSourceLabels } from "./ReviewForm";

export function ReviewsList() {
  return (
    <ListScreen<AdminReview>
      resource="reviews"
      title="Reviews"
      description="Featured reviews appear on the home page; all published reviews appear on the Reviews page."
      newLabel="Add review"
      emptyTitle="No reviews yet"
      columns={[
        {
          header: "Review",
          cell: (r) => (
            <div className="flex max-w-xl flex-col gap-0.5">
              <span className="font-semibold">
                {r.author} <span className="text-gold-600">{"★".repeat(r.rating)}</span>
              </span>
              <span className="line-clamp-1 text-sm text-ink-muted">{r.text || r.meta}</span>
            </div>
          ),
        },
        {
          header: "Type",
          cell: (r) => (
            <span className="flex flex-wrap gap-1.5">
              <Badge tone="info">{reviewSourceLabels[r.source]}</Badge>
              {r.featured && <Badge tone="gold">Home page</Badge>}
            </span>
          ),
        },
        {
          header: "Status",
          cell: (r) => <PublishedBadge published={r.published} />,
          className: "w-28",
        },
      ]}
    />
  );
}
