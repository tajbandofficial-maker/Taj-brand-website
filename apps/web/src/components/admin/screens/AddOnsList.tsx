"use client";

import type { AdminAddOn } from "@taj/types";

import { formatINR } from "@/lib/format";

import { PublishedBadge } from "../Badge";
import { ListScreen } from "../ListScreen";

export function AddOnsList() {
  return (
    <ListScreen<AdminAddOn>
      resource="addons"
      title="Add-ons"
      description="Extras shown under “Add to any package” on the Packages page."
      newLabel="Add add-on"
      emptyTitle="No add-ons yet"
      columns={[
        {
          header: "Add-on",
          cell: (a) => (
            <div className="flex flex-col">
              <span className="font-semibold">{a.name}</span>
              {a.description && <span className="text-sm text-ink-muted">{a.description}</span>}
            </div>
          ),
        },
        { header: "Links to", cell: (a) => a.service?.title ?? "—" },
        {
          header: "Price",
          cell: (a) => (a.startingPrice === null ? "On request" : formatINR(a.startingPrice)),
        },
        {
          header: "Status",
          cell: (a) => <PublishedBadge published={a.published} />,
          className: "w-28",
        },
      ]}
    />
  );
}
