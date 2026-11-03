import type { Metadata } from "next";

import { PackageForm } from "@/components/admin/screens/PackageForm";

export const metadata: Metadata = { title: "Add package" };

export default function Page() {
  return <PackageForm />;
}
