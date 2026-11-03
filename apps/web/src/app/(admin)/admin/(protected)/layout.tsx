import type { AdminMe } from "@taj/types";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AdminProviders } from "@/components/admin/AdminProviders";
import { AdminShell } from "@/components/admin/AdminShell";
import { SESSION_COOKIE } from "@/lib/admin/session";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Taj Band Admin" },
  robots: { index: false, follow: false },
};

/** Verifies the session with the API on every admin page load (never cached). */
async function getMe(token: string): Promise<AdminMe | null> {
  const res = await fetch(`${env.API_INTERNAL_URL}/admin/me`, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  }).catch(() => null);
  if (!res?.ok) return null;
  return (await res.json()) as AdminMe;
}

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const me = token ? await getMe(token) : null;
  if (!me) redirect("/admin/login");

  return (
    <AdminProviders>
      <AdminShell me={me}>{children}</AdminShell>
    </AdminProviders>
  );
}
