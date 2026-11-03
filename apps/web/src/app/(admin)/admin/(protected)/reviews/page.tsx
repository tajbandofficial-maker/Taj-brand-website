import type { Metadata } from "next";

import { ReviewsList } from "@/components/admin/screens/ReviewsList";

export const metadata: Metadata = { title: "Reviews" };

export default function Page() {
  return <ReviewsList />;
}
