import type { Metadata } from "next";

import { SettingsForm } from "@/components/admin/screens/SettingsForm";

export const metadata: Metadata = { title: "Site settings" };

export default function Page() {
  return <SettingsForm />;
}
