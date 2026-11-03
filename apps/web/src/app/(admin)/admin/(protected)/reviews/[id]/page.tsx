import type { Metadata } from "next";

import { ReviewForm } from "@/components/admin/screens/ReviewForm";

export const metadata: Metadata = { title: "Edit review" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // key: remount when switching between records so the form resets cleanly.
  return <ReviewForm key={id} id={id} />;
}
