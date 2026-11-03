"use client";

import type { AdminService } from "@taj/types";

import { PublishedBadge } from "../Badge";
import { ListScreen } from "../ListScreen";
import { Thumb } from "../Thumb";

export function ServicesList() {
  return (
    <ListScreen<AdminService>
      resource="services"
      title="Services"
      description="Each service has its own page on the website. The order here is the order in menus and on the home page."
      newLabel="Add service"
      emptyTitle="No services yet"
      columns={[
        { header: "", cell: (s) => <Thumb media={s.heroImage} />, className: "w-16" },
        {
          header: "Service",
          cell: (s) => (
            <div className="flex flex-col">
              <span className="font-semibold">{s.title}</span>
              <span className="text-sm text-ink-muted">/services/{s.slug}</span>
            </div>
          ),
        },
        { header: "FAQs", cell: (s) => s._count.faqs, className: "w-20" },
        {
          header: "Status",
          cell: (s) => <PublishedBadge published={s.published} />,
          className: "w-28",
        },
      ]}
    />
  );
}
