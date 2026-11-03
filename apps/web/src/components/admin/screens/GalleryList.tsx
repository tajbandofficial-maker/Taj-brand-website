"use client";

import type { AdminGalleryCategory, AdminGalleryItem } from "@taj/types";
import { useState } from "react";

import { cn } from "@/lib/cn";

import { Badge, PublishedBadge } from "../Badge";
import { ListScreen } from "../ListScreen";
import { Thumb } from "../Thumb";
import { categoryLabels } from "./gallery-meta";

type Filter = "ALL" | AdminGalleryCategory;

export function GalleryList() {
  const [filter, setFilter] = useState<Filter>("ALL");

  return (
    <ListScreen<AdminGalleryItem>
      resource="gallery"
      title="Gallery"
      description="Photos and videos for the Gallery page, the home page and service pages."
      newLabel="Add photo or video"
      emptyTitle="Nothing in this category yet"
      filter={filter === "ALL" ? undefined : (g) => g.category === filter}
      toolbar={
        <div role="group" aria-label="Filter by category" className="mb-4 flex flex-wrap gap-2">
          {(["ALL", ...Object.keys(categoryLabels)] as Filter[]).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
              className={cn(
                "min-h-9 cursor-pointer rounded-full border px-3.5 text-sm font-semibold",
                filter === c
                  ? "border-cocoa-900 bg-cocoa-900 text-cream-50"
                  : "border-sand-300 bg-white hover:border-gold-500",
              )}
            >
              {c === "ALL" ? "All" : categoryLabels[c]}
            </button>
          ))}
          {filter !== "ALL" && (
            <span className="self-center text-[13px] text-ink-muted">
              Choose “All” to change the order.
            </span>
          )}
        </div>
      }
      columns={[
        { header: "", cell: (g) => <Thumb media={g.media} size={56} />, className: "w-20" },
        {
          header: "Item",
          cell: (g) => (
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold">
                {g.caption || g.media?.alt || (g.type === "VIDEO" ? "Video" : "Photo")}
              </span>
              <span className="flex flex-wrap gap-1.5">
                <Badge>{g.type === "VIDEO" ? "Video" : "Photo"}</Badge>
                <Badge tone="info">{categoryLabels[g.category]}</Badge>
                {g.service && <Badge tone="gold">{g.service.title}</Badge>}
              </span>
            </div>
          ),
        },
        {
          header: "Status",
          cell: (g) => <PublishedBadge published={g.published} />,
          className: "w-28",
        },
      ]}
    />
  );
}
