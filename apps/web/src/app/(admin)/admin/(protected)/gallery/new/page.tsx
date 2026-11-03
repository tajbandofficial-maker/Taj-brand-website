import type { Metadata } from "next";

import { GalleryForm } from "@/components/admin/screens/GalleryForm";

export const metadata: Metadata = { title: "Add to gallery" };

export default function Page() {
  return <GalleryForm />;
}
