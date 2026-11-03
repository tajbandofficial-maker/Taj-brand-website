import type { Metadata } from "next";
import { Suspense } from "react";

import { InquiriesList } from "@/components/admin/screens/InquiriesList";

export const metadata: Metadata = { title: "Inquiries" };

export default function Page() {
  // InquiriesList keeps its filters in the URL (useSearchParams).
  return (
    <Suspense>
      <InquiriesList />
    </Suspense>
  );
}
