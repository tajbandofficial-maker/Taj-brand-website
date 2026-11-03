import type { Metadata } from "next";

import { AddOnsList } from "@/components/admin/screens/AddOnsList";

export const metadata: Metadata = { title: "Add-ons" };

export default function Page() {
  return <AddOnsList />;
}
