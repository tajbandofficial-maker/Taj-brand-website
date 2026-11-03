import type { Metadata } from "next";

import { GalleryForm } from "@/components/admin/screens/GalleryForm";

export const metadata: Metadata = { title: "Edit gallery item" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // key: remount when switching between records so the form resets cleanly.
  return <GalleryForm key={id} id={id} />;
}
