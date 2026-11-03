"use client";

import { useEffect, useRef } from "react";

import { useAdminUi } from "@/stores/admin-ui-store";

import { AdminButton } from "./AdminButton";

/** Single modal confirm used by `useAdminUi().confirm(...)` (e.g. before deleting). */
export function ConfirmDialog() {
  const req = useAdminUi((s) => s.confirmRequest);
  const settle = useAdminUi((s) => s.settleConfirm);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (req && !d.open) d.showModal();
    if (!req && d.open) d.close();
  }, [req]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onCancel={() => settle(false)}
      className="m-auto w-[min(100%-2rem,440px)] rounded-2xl border border-line bg-white p-0 text-ink shadow-2xl backdrop:bg-cocoa-950/50"
    >
      {req && (
        <div className="flex flex-col gap-4 p-6">
          <h2 id="confirm-title" className="m-0 font-sans text-lg font-bold">
            {req.title}
          </h2>
          <p className="m-0 text-[15px] text-ink-muted">{req.message}</p>
          <div className="mt-2 flex justify-end gap-2">
            <AdminButton onClick={() => settle(false)} autoFocus>
              Cancel
            </AdminButton>
            <AdminButton variant={req.danger ? "danger" : "primary"} onClick={() => settle(true)}>
              {req.confirmLabel}
            </AdminButton>
          </div>
        </div>
      )}
    </dialog>
  );
}
