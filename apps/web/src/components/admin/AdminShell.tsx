"use client";

import type { AdminMe, AdminStats } from "@taj/types";
import { useQuery } from "@tanstack/react-query";
import {
  ExternalLink,
  FileText,
  Gift,
  HelpCircle,
  Image as ImageIcon,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Music,
  Package,
  Settings,
  Star,
  Table2,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { bff } from "@/lib/admin/api";
import { cn } from "@/lib/cn";
import { useAdminUi } from "@/stores/admin-ui-store";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/inquiries", label: "Inquiries", icon: Mail },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/services", label: "Services", icon: Music },
  { href: "/admin/packages", label: "Packages", icon: Package },
  { href: "/admin/packages/comparison", label: "Compare table", icon: Table2 },
  { href: "/admin/addons", label: "Add-ons", icon: Gift },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/media", label: "Image library", icon: ImageIcon },
  { href: "/admin/settings", label: "Site settings", icon: Settings },
];

export function AdminShell({ me, children }: { me: AdminMe; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const open = useAdminUi((s) => s.sidebarOpen);
  const setOpen = useAdminUi((s) => s.setSidebarOpen);
  const stats = useQuery({
    queryKey: ["stats"],
    queryFn: () => bff<AdminStats>("stats"),
    refetchInterval: 60_000,
  });
  const newCount = stats.data?.byStatus.NEW ?? 0;
  // The most specific matching item wins (Compare table, not Packages, on its own screen).
  const activeHref = nav
    .filter(({ href, exact }) =>
      exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  useEffect(() => setOpen(false), [pathname, setOpen]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const sidebar = (
    <nav aria-label="Admin" className="flex h-full flex-col gap-1 p-3">
      <Link href="/admin" className="mb-4 flex items-center gap-2 px-3 py-2">
        <span className="font-serif text-xl text-cream-50">Taj Band</span>
        <span className="rounded bg-gold-500/20 px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-gold-300 uppercase">
          Admin
        </span>
      </Link>
      {nav.map(({ href, label, icon: Icon }) => {
        const active = href === activeHref;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg px-3 text-[15px] font-medium transition-colors",
              active
                ? "bg-gold-500 text-cocoa-900"
                : "text-sand-200 hover:bg-white/5 hover:text-cream-50",
            )}
          >
            <Icon aria-hidden="true" className="size-[18px]" />
            <span className="flex-1">{label}</span>
            {href === "/admin/inquiries" && newCount > 0 && (
              <span
                className={cn(
                  "rounded-full px-2 text-xs font-bold",
                  active ? "bg-cocoa-900 text-cream-50" : "bg-gold-500 text-cocoa-900",
                )}
              >
                {newCount}
              </span>
            )}
          </Link>
        );
      })}
      <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-[15px] text-sand-200 hover:bg-white/5 hover:text-cream-50"
        >
          <ExternalLink aria-hidden="true" className="size-[18px]" />
          View website
        </a>
        <p className="m-0 truncate px-3 pt-2 text-xs text-sand-400" title={me.email}>
          Signed in as {me.email}
        </p>
        <button
          type="button"
          onClick={logout}
          className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 text-[15px] text-sand-200 hover:bg-white/5 hover:text-cream-50"
        >
          <LogOut aria-hidden="true" className="size-[18px]" />
          Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-dvh bg-cream-50 text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 overflow-y-auto bg-cocoa-900 lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-cocoa-950/50"
          />
          <aside className="relative h-full w-72 max-w-[85vw] overflow-y-auto bg-cocoa-900">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 flex size-10 cursor-pointer items-center justify-center rounded-lg text-sand-200"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-cream-50/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="flex size-10 cursor-pointer items-center justify-center rounded-lg border border-sand-300 bg-white"
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>
          <span className="font-serif text-lg text-cocoa-900">Taj Band Admin</span>
        </header>
        <main id="main" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
