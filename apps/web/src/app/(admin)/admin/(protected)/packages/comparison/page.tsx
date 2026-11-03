import type { Metadata } from "next";

import { ComparisonEditor } from "@/components/admin/screens/ComparisonEditor";

export const metadata: Metadata = { title: "Package comparison" };

export default function Page() {
  return <ComparisonEditor />;
}
