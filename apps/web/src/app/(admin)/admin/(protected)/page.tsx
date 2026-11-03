import type { Metadata } from "next";

import { Dashboard } from "@/components/admin/screens/Dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default function AdminHome() {
  return <Dashboard />;
}
