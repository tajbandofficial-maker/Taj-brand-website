import type { Metadata } from "next";

import { FaqsList } from "@/components/admin/screens/FaqsList";

export const metadata: Metadata = { title: "FAQs" };

export default function Page() {
  return <FaqsList />;
}
