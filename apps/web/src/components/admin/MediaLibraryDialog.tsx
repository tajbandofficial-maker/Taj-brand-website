"use client";

import type { AdminMedia } from "@taj/types";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import { useList } from "@/lib/admin/queries";

import { AdminButton } from "./AdminButton";
import { ErrorState, LoadingState } from "./States";

type Props = { open: boolean; onClose: () => void; onPick: (media: AdminMedia) => void };

/** Grid of previously uploaded images to reuse. */
export function MediaLibraryDialog({ open, onClose, onPick }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const media = useList<AdminMedia>("media");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="library-title"
      className="m-auto h-[min(100dvh-2rem,720px)] w-[min(100%-2rem,960px)] rounded-2xl border border-line bg-cream-50 p-0 text-ink shadow-2xl backdrop:bg-cocoa-950/50"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-line bg-white px-5 py-3">
          <h2 id="library-title" className="m-0 font-sans text-lg font-bold">
            Choose an image
          </h2>
          <AdminButton variant="ghost" size="sm" aria-label="Close" onClick={onClose}>
            <X aria-hidden="true" className="size-5" />
          </AdminButton>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {open && media.isLoading && <LoadingState />}
          {media.error && <ErrorState error={media.error} onRetry={() => void media.refetch()} />}
          {media.data?.length === 0 && <p className="text-ink-muted">No images uploaded yet.</p>}
          <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 md:grid-cols-4">
            {media.data?.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(m);
                    onClose();
                  }}
                  className="group flex w-full cursor-pointer flex-col gap-1.5 rounded-lg border border-line bg-white p-1.5 text-left hover:border-gold-500"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail; next/image optimisation not needed here */}
                  <img
                    src={m.url}
                    alt=""
                    loading="lazy"
                    className="aspect-square w-full rounded object-cover"
                  />
                  <span className="line-clamp-2 px-1 text-xs text-ink-muted">{m.alt}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </dialog>
  );
}
