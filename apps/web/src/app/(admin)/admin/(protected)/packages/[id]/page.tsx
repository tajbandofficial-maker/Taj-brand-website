import type { Metadata } from "next";

import { PackageForm } from "@/components/admin/screens/PackageForm";

export const metadata: Metadata = { title: "Edit package" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // key: remount when switching between records so the form resets cleanly.
  return <PackageForm key={id} id={id} />;
}
