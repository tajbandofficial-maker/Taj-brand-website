"use client";

import type { AdminPackage } from "@taj/types";
import { Table2 } from "lucide-react";

import { formatINR } from "@/lib/format";

import { AdminLinkButton } from "../AdminButton";
import { Badge, PublishedBadge } from "../Badge";
import { ListScreen } from "../ListScreen";

export function PackagesList() {
  return (
    <ListScreen<AdminPackage>
      resource="packages"
      title="Packages"
      description="Packages appear on the home page and the Packages page. Leave the price empty to show “Price on request”."
      newLabel="Add package"
      emptyTitle="No packages yet"
      toolbar={
        <div className="mb-4 flex flex-wrap gap-2">
          <AdminLinkButton href="/admin/packages/comparison" size="sm">
            <Table2 aria-hidden="true" className="size-4" />
            Edit comparison table
          </AdminLinkButton>
          <AdminLinkButton href="/admin/addons" size="sm">
            Edit add-ons
          </AdminLinkButton>
        </div>
      }
      columns={[
        {
          header: "Package",
          cell: (p) => (
            <div className="flex items-center gap-2">
              <span className="font-semibold">{p.name}</span>
              {p.highlighted && <Badge tone="gold">Most booked</Badge>}
            </div>
          ),
        },
        {
          header: "Starting price",
          cell: (p) => (p.startingPrice === null ? "On request" : formatINR(p.startingPrice)),
        },
        { header: "Items", cell: (p) => p.inclusions.length, className: "w-20" },
        {
          header: "Status",
          cell: (p) => <PublishedBadge published={p.published} />,
          className: "w-28",
        },
      ]}
    />
  );
}
