"use client";

import type { AdminPage } from "@taj/types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { formatDate } from "@/lib/admin/form";
import { useList } from "@/lib/admin/queries";

import { Badge } from "../Badge";
import { PageHeader } from "../PageHeader";
import { ErrorState, LoadingState } from "../States";
import { Thumb } from "../Thumb";

export function PagesList() {
  const list = useList<AdminPage>("pages");

  return (
    <>
      <PageHeader
        title="Pages"
        description="Headings, text, photos, videos and Google settings of each website page. Services, packages, photos and reviews themselves are edited in their own sections."
      />
      {list.isLoading && <LoadingState />}
      {list.error && <ErrorState error={list.error} onRetry={() => void list.refetch()} />}
      <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2">
        {list.data?.map((p) => (
          <li key={p.key}>
            <Link
              href={`/admin/pages/${p.key}`}
              className="flex min-h-20 items-center gap-4 rounded-xl border border-line bg-white p-4 text-ink transition-colors hover:border-gold-500 hover:text-ink"
            >
              <Thumb media={p.heroImage ?? p.ogImage} size={56} />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-semibold text-cocoa-900">{p.label}</span>
                <span className="text-sm text-ink-muted">
                  {p.path} · {p.updatedAt ? `Edited ${formatDate(p.updatedAt)}` : "Default text"}
                </span>
                <span className="flex flex-wrap gap-1.5">
                  {p.youtubeId && <Badge tone="info">Video</Badge>}
                  {p.seoTitle || p.seoDescription ? (
                    <Badge tone="success">Custom SEO</Badge>
                  ) : (
                    <Badge>Default SEO</Badge>
                  )}
                </span>
              </div>
              <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-ink-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
