"use client";

import { CheckCircle2, X, XCircle } from "lucide-react";

import { cn } from "@/lib/cn";
import { useAdminUi } from "@/stores/admin-ui-store";

export function Toaster() {
  const toasts = useAdminUi((s) => s.toasts);
  const dismiss = useAdminUi((s) => s.dismiss);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[min(100%-2rem,380px)] flex-col gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.kind === "error" ? "alert" : "status"}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg",
            t.kind === "success"
              ? "border-[#bfe3c9] bg-white text-ink"
              : "border-[#e7b4ae] bg-[#fdecea] text-[#7a1a14]",
          )}
        >
          {t.kind === "success" ? (
            <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#1d6b38]" />
          ) : (
            <XCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          )}
          <p className="m-0 flex-1">{t.message}</p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => dismiss(t.id)}
            className="cursor-pointer text-ink-muted hover:text-ink"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
