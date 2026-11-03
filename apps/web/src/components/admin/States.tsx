import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-2 py-12 text-ink-muted">
      <Loader2 aria-hidden="true" className="size-5 animate-spin" />
      {label}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-xl border border-[#e7b4ae] bg-[#fdecea] p-5 text-[#7a1a14]"
    >
      <div className="flex items-center gap-2 font-semibold">
        <AlertTriangle aria-hidden="true" className="size-5" />
        Couldn&apos;t load this
      </div>
      <p className="m-0 text-sm">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="cursor-pointer text-sm font-semibold underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-sand-300 bg-white px-6 py-12 text-center">
      <Inbox aria-hidden="true" className="size-8 text-sand-400" />
      <p className="m-0 font-semibold text-ink">{title}</p>
      {children}
    </div>
  );
}
