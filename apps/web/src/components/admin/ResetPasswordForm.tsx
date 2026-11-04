"use client";

import { useFormik } from "formik";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminButton } from "./AdminButton";
import { inputClasses } from "./fields/FieldShell";

type Values = { password: string; confirm: string };

/** New password + confirmation for a reset link; on success, back to sign in. */
export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik<Values>({
    initialValues: { password: "", confirm: "" },
    validate: (v) => {
      const e: Partial<Values> = {};
      if (v.password.length < 8) e.password = "Use at least 8 characters";
      else if (v.password.length > 200) e.password = "Use at most 200 characters";
      if (v.confirm !== v.password) e.confirm = "The passwords don't match";
      return e;
    },
    onSubmit: async ({ password }) => {
      setError(null);
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password }),
      }).catch(() => null);
      if (res?.ok) {
        router.replace("/admin/login?reset=1");
        return;
      }
      const body = (await res?.json().catch(() => null)) as { message?: string } | null;
      setError(body?.message ?? "Could not change the password. Please try again.");
    },
  });

  if (!token) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p role="alert" className="m-0 rounded-lg bg-[#fdecea] px-3 py-3 text-sm text-[#7a1a14]">
          This page needs the link from the reset email.
        </p>
        <Link
          href="/admin/forgot-password"
          className="text-sm font-semibold text-gold-700 hover:underline"
        >
          Send a new reset link
        </Link>
      </div>
    );
  }

  const fieldError = (k: keyof Values) => (formik.touched[k] ? formik.errors[k] : undefined);
  const expired = error?.includes("expired");

  return (
    <form noValidate onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-semibold">
          New password
        </label>
        <div className="relative">
          <input
            id="password"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            autoFocus
            {...formik.getFieldProps("password")}
            aria-invalid={fieldError("password") ? true : undefined}
            className={`${inputClasses(Boolean(fieldError("password")))} min-h-12 pr-12`}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-ink-muted hover:text-ink"
          >
            {show ? (
              <EyeOff aria-hidden="true" className="size-[18px]" />
            ) : (
              <Eye aria-hidden="true" className="size-[18px]" />
            )}
          </button>
        </div>
        {fieldError("password") && (
          <p className="m-0 text-[13px] text-[#b3261e]">{fieldError("password")}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm" className="text-sm font-semibold">
          Repeat new password
        </label>
        <input
          id="confirm"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          {...formik.getFieldProps("confirm")}
          aria-invalid={fieldError("confirm") ? true : undefined}
          className={`${inputClasses(Boolean(fieldError("confirm")))} min-h-12`}
        />
        {fieldError("confirm") && (
          <p className="m-0 text-[13px] text-[#b3261e]">{fieldError("confirm")}</p>
        )}
      </div>
      <div aria-live="polite">
        {error && (
          <p role="alert" className="m-0 rounded-lg bg-[#fdecea] px-3 py-2 text-sm text-[#7a1a14]">
            {error}{" "}
            {expired && (
              <Link href="/admin/forgot-password" className="font-semibold underline">
                Send a new link
              </Link>
            )}
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
        {formik.isSubmitting ? "Saving…" : "Save new password"}
      </AdminButton>
    </form>
  );
}
