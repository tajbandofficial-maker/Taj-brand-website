import type { Metadata } from "next";

import { AddOnForm } from "@/components/admin/screens/AddOnForm";

export const metadata: Metadata = { title: "Edit add-on" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // key: remount when switching between records so the form resets cleanly.
  return <AddOnForm key={id} id={id} />;
}
