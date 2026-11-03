import type { Metadata } from "next";

import { MediaLibrary } from "@/components/admin/screens/MediaLibrary";

export const metadata: Metadata = { title: "Image library" };

export default function Page() {
  return <MediaLibrary />;
}
