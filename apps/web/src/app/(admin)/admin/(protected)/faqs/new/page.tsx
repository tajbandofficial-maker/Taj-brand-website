import type { Metadata } from "next";

import { FaqForm } from "@/components/admin/screens/FaqForm";

export const metadata: Metadata = { title: "Add question" };

export default function Page() {
  return <FaqForm />;
}
