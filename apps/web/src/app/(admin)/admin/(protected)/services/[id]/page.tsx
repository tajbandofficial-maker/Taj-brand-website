import type { Metadata } from "next";

import { ServiceForm } from "@/components/admin/screens/ServiceForm";

export const metadata: Metadata = { title: "Edit service" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // key: remount when switching between records so the form resets cleanly.
  return <ServiceForm key={id} id={id} />;
}
