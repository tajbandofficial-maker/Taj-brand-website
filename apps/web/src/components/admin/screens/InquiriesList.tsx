"use client";

import type { AdminInquiryPage, InquiryStatus } from "@taj/types";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { bff } from "@/lib/admin/api";
import { formatDate, formatDateTime } from "@/lib/admin/form";
import { cn } from "@/lib/cn";

import { AdminButton } from "../AdminButton";
import { inputClasses } from "../fields/FieldShell";
import { InquiryStatusBadge, inquiryStatusMeta } from "../InquiryStatusBadge";
import { PageHeader } from "../PageHeader";
import { EmptyState, ErrorState, LoadingState } from "../States";

const STATUSES = Object.keys(inquiryStatusMeta) as InquiryStatus[];

export function InquiriesList() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const status = params.get("status") ?? "";
  const q = params.get("q") ?? "";
  const page = Number(params.get("page") ?? "1") || 1;
  const [search, setSearch] = useState(q);
  // Keep the search box in sync when the URL changes (back/forward, filter chips).
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setSearch(q);
  }

  const setParam = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    router.replace(`${pathname}?${next.toString()}`);
  };

  const qs = new URLSearchParams({
    page: String(page),
    pageSize: "25",
    ...(status ? { status } : {}),
    ...(q ? { q } : {}),
  });
  const list = useQuery({
    queryKey: ["inquiries", "list", qs.toString()],
    queryFn: () => bff<AdminInquiryPage>(`inquiries?${qs}`),
  });
  const pages = list.data ? Math.max(1, Math.ceil(list.data.total / list.data.pageSize)) : 1;

  return (
    <>
      <PageHeader
        title="Inquiries"
        description="Enquiries sent from the website form. Update the status as you follow up."
      />

      <div className="mb-4 flex flex-col gap-3">
        <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
          {[
            { value: "", label: "All (except spam)" },
            ...STATUSES.map((s) => ({ value: s, label: inquiryStatusMeta[s].label })),
          ].map((o) => (
            <button
              key={o.value}
              type="button"
              aria-pressed={status === o.value}
              onClick={() => setParam({ status: o.value, page: "" })}
              className={cn(
                "min-h-9 cursor-pointer rounded-full border px-3.5 text-sm font-semibold",
                status === o.value
                  ? "border-cocoa-900 bg-cocoa-900 text-cream-50"
                  : "border-sand-300 bg-white hover:border-gold-500",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setParam({ q: search.trim(), page: "" });
          }}
          className="flex max-w-md gap-2"
        >
          <label htmlFor="inq-search" className="sr-only">
            Search by name, phone or venue
          </label>
          <input
            id="inq-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone or venue"
            className={`${inputClasses(false)} min-h-10 flex-1`}
          />
          <AdminButton type="submit" size="sm">
            <Search aria-hidden="true" className="size-4" />
            Search
          </AdminButton>
        </form>
      </div>

      {list.isLoading && <LoadingState />}
      {list.error && <ErrorState error={list.error} onRetry={() => void list.refetch()} />}
      {list.data && list.data.items.length === 0 && <EmptyState title="No enquiries found" />}
      {list.data && list.data.items.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full min-w-[720px] border-collapse text-[15px]">
            <thead>
              <tr className="text-left text-xs tracking-wide text-ink-muted uppercase">
                <th className="px-3 py-2.5 font-semibold">Received</th>
                <th className="px-3 py-2.5 font-semibold">Name</th>
                <th className="px-3 py-2.5 font-semibold">Phone</th>
                <th className="px-3 py-2.5 font-semibold">Wedding date</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.data.items.map((i) => (
                <tr key={i.id} className="border-t border-line hover:bg-cream-50">
                  <td className="px-3 py-2.5 text-sm text-ink-muted">
                    {formatDateTime(i.createdAt)}
                  </td>
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/admin/inquiries/${i.id}`}
                      className="font-semibold text-ink hover:text-gold-700"
                    >
                      {i.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5">+{i.phone}</td>
                  <td className="px-3 py-2.5">{formatDate(i.weddingDate)}</td>
                  <td className="px-3 py-2.5">
                    <InquiryStatusBadge status={i.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pages > 1 && (
        <nav aria-label="Pages" className="mt-4 flex items-center gap-2">
          <AdminButton
            size="sm"
            disabled={page <= 1}
            onClick={() => setParam({ page: String(page - 1) })}
          >
            Previous
          </AdminButton>
          <span className="text-sm text-ink-muted">
            Page {page} of {pages}
          </span>
          <AdminButton
            size="sm"
            disabled={page >= pages}
            onClick={() => setParam({ page: String(page + 1) })}
          >
            Next
          </AdminButton>
        </nav>
      )}
    </>
  );
}
