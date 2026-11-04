import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCard } from "@/components/admin/AuthCard";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthCard title="Admin sign in" subtitle="Manage the Taj Band website.">
      {/* LoginForm reads ?next= and ?reset= (useSearchParams), which needs a Suspense boundary. */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
