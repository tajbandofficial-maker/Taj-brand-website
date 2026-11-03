"use client";

import type { AdminMedia } from "@taj/types";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";

import { bff } from "@/lib/admin/api";
import { useList, useRemove } from "@/lib/admin/queries";
import { useAdminUi } from "@/stores/admin-ui-store";

import { AdminButton } from "../AdminButton";
import { Badge } from "../Badge";
import { inputClasses } from "../fields/FieldShell";
import { PageHeader } from "../PageHeader";
import { EmptyState, ErrorState, LoadingState } from "../States";

const uses = (m: AdminMedia) =>
  m._count
    ? m._count.serviceHeroes + m._count.galleryItems + m._count.reviewImages + m._count.homeHeroes
    : 0;

function MediaCard({ media }: { media: AdminMedia }) {
  const [alt, setAlt] = useState(media.alt);
  const [saving, setSaving] = useState(false);
  const remove = useRemove("media");
  const qc = useQueryClient();
  const toast = useAdminUi((s) => s.toast);
  const confirm = useAdminUi((s) => s.confirm);
  const count = uses(media);

  async function saveAlt() {
    if (!alt.trim() || alt === media.alt) return;
    setSaving(true);
    try {
      await bff(`media/${media.id}`, { method: "PATCH", body: { alt: alt.trim() } });
      await qc.invalidateQueries({ queryKey: ["media"] });
      toast("success", "Description saved");
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function del() {
    const ok = await confirm({
      title: "Delete image?",
      message: "It will be permanently removed.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    remove.mutate(media.id, {
      onSuccess: () => toast("success", "Image deleted"),
      onError: (e) => toast("error", e.message),
    });
  }

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-line bg-white p-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
      <img
        src={media.url}
        alt=""
        loading="lazy"
        className="aspect-[4/3] w-full rounded-lg object-cover"
      />
      <div className="flex items-center justify-between gap-2 px-1">
        <Badge tone={count ? "success" : "neutral"}>{count ? `Used ${count}×` : "Not used"}</Badge>
        {media.width && media.height && (
          <span className="text-xs text-ink-muted">
            {media.width}×{media.height}
          </span>
        )}
      </div>
      <label className="sr-only" htmlFor={`alt-${media.id}`}>
        Image description
      </label>
      <textarea
        id={`alt-${media.id}`}
        value={alt}
        rows={2}
        maxLength={200}
        onChange={(e) => setAlt(e.target.value)}
        onBlur={() => void saveAlt()}
        className={`${inputClasses(!alt.trim())} py-2 text-sm`}
      />
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="text-xs text-ink-muted">
          {saving ? "Saving…" : "Description saves when you click away"}
        </span>
        <AdminButton
          size="sm"
          variant="ghost"
          aria-label="Delete image"
          disabled={count > 0}
          title={count > 0 ? "Remove it where it's used first" : undefined}
          onClick={() => void del()}
        >
          <Trash2 aria-hidden="true" className="size-4" />
        </AdminButton>
      </div>
    </li>
  );
}

export function MediaLibrary() {
  const media = useList<AdminMedia>("media");
  return (
    <>
      <PageHeader
        title="Image library"
        description="Every uploaded image. Edit descriptions (alt text) here; images can only be deleted when nothing uses them."
      />
      {media.isLoading && <LoadingState />}
      {media.error && <ErrorState error={media.error} onRetry={() => void media.refetch()} />}
      {media.data?.length === 0 && (
        <EmptyState title="No images yet">
          Upload images from any service, gallery or settings form.
        </EmptyState>
      )}
      <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {media.data?.map((m) => (
          <MediaCard key={m.id} media={m} />
        ))}
      </ul>
    </>
  );
}
