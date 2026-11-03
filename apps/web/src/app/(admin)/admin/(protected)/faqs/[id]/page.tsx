import type { Metadata } from "next";

import { FaqForm } from "@/components/admin/screens/FaqForm";

export const metadata: Metadata = { title: "Edit question" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // key: remount when switching between records so the form resets cleanly.
  return <FaqForm key={id} id={id} />;
}
