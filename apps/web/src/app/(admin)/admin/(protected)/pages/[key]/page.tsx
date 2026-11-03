import { isPageKey } from "@taj/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageForm } from "@/components/admin/screens/PageForm";

export const metadata: Metadata = { title: "Edit page" };

export default async function Page({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!isPageKey(key)) notFound();
  // key: remount when switching between pages so the form resets cleanly.
  return <PageForm key={key} pageKey={key} />;
}
