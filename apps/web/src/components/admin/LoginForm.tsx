"use client";

import { useFormik } from "formik";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { AdminButton } from "./AdminButton";
import { inputClasses } from "./fields/FieldShell";

type Values = { email: string; password: string };

/** Only allow same-site relative paths under /admin as the post-login target. */
function safeNext(next: string | null): string {
  return next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const justReset = params.get("reset") === "1";

  const formik = useFormik<Values>({
    initialValues: { email: "", password: "" },
    validate: (v) => {
      const e: Partial<Values> = {};
      if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = "Enter your email address";
      if (!v.password) e.password = "Enter your password";
      return e;
    },
    onSubmit: async (values) => {
      setError(null);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        router.replace(safeNext(params.get("next")));
        router.refresh();
        return;
      }
      const body = (await res.json().catch(() => null)) as { message?: string } | null;
      setError(body?.message ?? "Could not sign in. Please try again.");
    },
  });

  const fieldError = (k: keyof Values) => (formik.touched[k] ? formik.errors[k] : undefined);

  return (
    <form noValidate onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
      {justReset && !error && (
        <p
          role="status"
          className="m-0 rounded-lg border border-[#b9dfc4] bg-[#e8f5ec] px-3 py-2 text-sm text-[#1d5c33]"
        >
          Password changed. Sign in with your new password.
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          autoFocus
          {...formik.getFieldProps("email")}
          aria-invalid={fieldError("email") ? true : undefined}
          className={`${inputClasses(Boolean(fieldError("email")))} min-h-12`}
        />
        {fieldError("email") && (
          <p className="m-0 text-[13px] text-[#b3261e]">{fieldError("email")}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="password" className="text-sm font-semibold">
            Password
          </label>
          <Link
            href="/admin/forgot-password"
            className="text-[13px] font-semibold text-gold-700 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...formik.getFieldProps("password")}
          aria-invalid={fieldError("password") ? true : undefined}
          className={`${inputClasses(Boolean(fieldError("password")))} min-h-12`}
        />
        {fieldError("password") && (
          <p className="m-0 text-[13px] text-[#b3261e]">{fieldError("password")}</p>
        )}
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
        {formik.isSubmitting ? "Signing in…" : "Sign in"}
      </AdminButton>
    </form>
  );
}
