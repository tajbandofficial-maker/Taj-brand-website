import type { Metadata } from "next";

import { ServicesList } from "@/components/admin/screens/ServicesList";

export const metadata: Metadata = { title: "Services" };

export default function Page() {
  return <ServicesList />;
}
