"use client";

import type { AdminStats } from "@taj/types";
import { useQuery } from "@tanstack/react-query";
import { FileText, Images, Mail, Music, Package, Settings, Star } from "lucide-react";
import Link from "next/link";

import { bff } from "@/lib/admin/api";
import { formatDate, formatDateTime } from "@/lib/admin/form";

import { InquiryStatusBadge } from "../InquiryStatusBadge";
import { PageHeader } from "../PageHeader";
import { Panel } from "../Panel";
import { ErrorState, LoadingState } from "../States";

const quickLinks = [
  { href: "/admin/inquiries", label: "Inquiries", icon: Mail },
  { href: "/admin/pages", label: "Page text, photos & SEO", icon: FileText },
  { href: "/admin/services", label: "Services", icon: Music },
  { href: "/admin/packages", label: "Packages", icon: Package },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/settings", label: "Phone, address & hours", icon: Settings },
];

export function Dashboard() {
  const stats = useQuery({ queryKey: ["stats"], queryFn: () => bff<AdminStats>("stats") });

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="New enquiries and quick links to everything on the website."
      />
      {stats.isLoading && <LoadingState />}
      {stats.error && <ErrorState error={stats.error} onRetry={() => void stats.refetch()} />}
      {stats.data && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {[
              {
                label: "New enquiries",
                value: stats.data.byStatus.NEW,
                href: "/admin/inquiries?status=NEW",
                strong: true,
              },
              {
                label: "Contacted",
                value: stats.data.byStatus.CONTACTED,
                href: "/admin/inquiries?status=CONTACTED",
              },
              {
                label: "Booked",
                value: stats.data.byStatus.BOOKED,
                href: "/admin/inquiries?status=BOOKED",
              },
              { label: "Last 7 days", value: stats.data.last7Days, href: "/admin/inquiries" },
              { label: "Last 30 days", value: stats.data.last30Days, href: "/admin/inquiries" },
            ].map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className={`flex flex-col gap-1 rounded-xl border p-4 transition-colors hover:border-gold-500 ${
                  s.strong && s.value > 0
                    ? "border-gold-500 bg-gold-500/10"
                    : "border-line bg-white"
                }`}
              >
                <span className="font-serif text-3xl text-cocoa-900">{s.value}</span>
                <span className="text-sm text-ink-muted">{s.label}</span>
              </Link>
            ))}
          </div>

          <Panel title="Latest enquiries">
            {stats.data.recent.length === 0 ? (
              <p className="m-0 text-ink-muted">
                No enquiries yet. They appear here as soon as someone sends the website form.
              </p>
            ) : (
              <ul className="m-0 flex list-none flex-col divide-y divide-line p-0">
                {stats.data.recent.map((i) => (
                  <li key={i.id}>
                    <Link
                      href={`/admin/inquiries/${i.id}`}
                      className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 hover:text-gold-700"
                    >
                      <span className="min-w-[140px] font-semibold">{i.name}</span>
                      <span className="text-sm text-ink-muted">
                        Wedding: {formatDate(i.weddingDate)}
                      </span>
                      <span className="text-sm text-ink-muted">{formatDateTime(i.createdAt)}</span>
                      <span className="ml-auto">
                        <InquiryStatusBadge status={i.status} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Edit the website">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {quickLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex min-h-14 items-center gap-3 rounded-lg border border-line px-4 font-semibold hover:border-gold-500 hover:bg-cream-50"
                >
                  <Icon aria-hidden="true" className="size-5 text-gold-700" />
                  {label}
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </>
  );
}
