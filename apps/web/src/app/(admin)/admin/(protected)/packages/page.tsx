import type { Metadata } from "next";

import { PackagesList } from "@/components/admin/screens/PackagesList";

export const metadata: Metadata = { title: "Packages" };

export default function Page() {
  return <PackagesList />;
}
