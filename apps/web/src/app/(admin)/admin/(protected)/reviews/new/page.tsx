import type { Metadata } from "next";

import { ReviewForm } from "@/components/admin/screens/ReviewForm";

export const metadata: Metadata = { title: "Add review" };

export default function Page() {
  return <ReviewForm />;
}
