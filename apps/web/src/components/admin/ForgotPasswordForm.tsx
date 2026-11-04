"use client";

import { useFormik } from "formik";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AdminButton } from "./AdminButton";
import { inputClasses } from "./fields/FieldShell";

const backLink = (
  <Link
    href="/admin/login"
    className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-gold-700 hover:underline"
  >
    <ArrowLeft aria-hidden="true" className="size-4" /> Back to sign in
  </Link>
);

/** Asks for the admin email; the API emails a reset link to the official inbox. */
export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: { email: "" },
    validate: (v) => (/^\S+@\S+\.\S+$/.test(v.email) ? {} : { email: "Enter an email address" }),
    onSubmit: async (values) => {
      setError(null);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      }).catch(() => null);
      if (res?.ok) {
        setSent(true);
        return;
      }
      const body = (await res?.json().catch(() => null)) as { message?: string } | null;
      setError(body?.message ?? "Could not send the email. Please try again.");
    },
  });

  if (sent) {
    return (
      <div className="flex flex-col gap-5 text-center">
        <div
          role="status"
          className="flex flex-col items-center gap-2 rounded-xl border border-gold-500/40 bg-cream-100 px-4 py-5"
        >
          <MailCheck aria-hidden="true" className="size-8 text-gold-700" />
          <p className="m-0 text-[15px] font-semibold text-cocoa-900">Check the official inbox</p>
          <p className="m-0 text-sm leading-relaxed text-ink-muted">
            If <strong className="text-ink">{formik.values.email}</strong> is an admin or the
            official Taj Band email, a reset link is on its way to the Taj Band inbox. It works
            once, for 30 minutes. Check Spam too.
          </p>
        </div>
        {backLink}
      </div>
    );
  }

  const fieldError = formik.touched.email ? formik.errors.email : undefined;

  return (
    <form noValidate onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold">
          Admin email or the official Taj Band email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          autoFocus
          {...formik.getFieldProps("email")}
          aria-invalid={fieldError ? true : undefined}
          className={`${inputClasses(Boolean(fieldError))} min-h-12`}
        />
        {fieldError && <p className="m-0 text-[13px] text-[#b3261e]">{fieldError}</p>}
      </div>
      <div aria-live="polite">
        {error && (
          <p role="alert" className="m-0 rounded-lg bg-[#fdecea] px-3 py-2 text-sm text-[#7a1a14]">
            {error}
          </p>
        )}
      </div>
      <AdminButton
        type="submit"
        variant="primary"
        className="min-h-12"
        disabled={formik.isSubmitting}
      >
        {formik.isSubmitting && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
        {formik.isSubmitting ? "Sending…" : "Email me a reset link"}
      </AdminButton>
      {backLink}
    </form>
  );
}
