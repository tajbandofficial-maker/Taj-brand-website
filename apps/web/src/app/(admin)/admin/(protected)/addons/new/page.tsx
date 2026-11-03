import type { Metadata } from "next";

import { AddOnForm } from "@/components/admin/screens/AddOnForm";

export const metadata: Metadata = { title: "Add add-on" };

export default function Page() {
  return <AddOnForm />;
}
