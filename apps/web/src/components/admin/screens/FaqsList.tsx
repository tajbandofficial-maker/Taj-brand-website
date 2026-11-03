"use client";

import type { AdminFaq, AdminService } from "@taj/types";
import { useState } from "react";

import { useList } from "@/lib/admin/queries";

import { Badge, PublishedBadge } from "../Badge";
import { inputClasses } from "../fields/FieldShell";
import { ListScreen } from "../ListScreen";

export function FaqsList() {
  const services = useList<AdminService>("services");
  const [serviceId, setServiceId] = useState("");

  return (
    <ListScreen<AdminFaq>
      resource="faqs"
      title="FAQs"
      description="Questions shown on service pages. Pick a service to change the order of its questions."
      newLabel="Add question"
      emptyTitle="No questions for this service yet"
      query={serviceId ? `serviceId=${serviceId}` : ""}
      reorderable={Boolean(serviceId)}
      toolbar={
        <div className="mb-4 flex max-w-sm flex-col gap-1.5">
          <label htmlFor="faq-service" className="text-sm font-semibold">
            Service
          </label>
          <select
            id="faq-service"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className={`${inputClasses(false)} min-h-11`}
          >
            <option value="">All questions</option>
            {services.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      }
      columns={[
        {
          header: "Question",
          cell: (f) => (
            <div className="flex max-w-xl flex-col gap-0.5">
              <span className="font-semibold">{f.question}</span>
              <span className="line-clamp-1 text-sm text-ink-muted">{f.answer}</span>
            </div>
          ),
        },
        {
          header: "Page",
          cell: (f) => (
            <Badge tone={f.service ? "info" : "neutral"}>{f.service?.title ?? "General"}</Badge>
          ),
        },
        {
          header: "Status",
          cell: (f) => <PublishedBadge published={f.published} />,
          className: "w-28",
        },
      ]}
    />
  );
}
