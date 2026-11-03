import type { Metadata } from "next";

import { GalleryList } from "@/components/admin/screens/GalleryList";

export const metadata: Metadata = { title: "Gallery" };

export default function Page() {
  return <GalleryList />;
}
