import type { Metadata } from "next";

import { AuthCard } from "@/components/admin/AuthCard";
import { ForgotPasswordForm } from "@/components/admin/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="We'll email a reset link to the official Taj Band inbox."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
