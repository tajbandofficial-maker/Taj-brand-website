"use client";

import type { AdminMedia } from "@taj/types";
import { useQueryClient } from "@tanstack/react-query";
import { useField } from "formik";
import { Library, Loader2, Trash2, Upload } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { ACCEPTED_IMAGE_TYPES, uploadImage } from "@/lib/admin/upload";
import { useAdminUi } from "@/stores/admin-ui-store";

import { AdminButton } from "../AdminButton";
import { MediaLibraryDialog } from "../MediaLibraryDialog";
import { inputClasses } from "./FieldShell";

type Props = {
  /** Formik field holding the media id (or null). */
  name: string;
  label: string;
  help?: ReactNode;
  required?: boolean;
  /** The currently linked media record, for the preview. */
  initialMedia: AdminMedia | null;
};

/** Pick an image: upload a new one (alt text required) or reuse one from the library. */
export function MediaField({ name, label, help, required, initialMedia }: Props) {
  const [, meta, helpers] = useField<string | null>(name);
  const [media, setMedia] = useState<AdminMedia | null>(initialMedia);
  const [pending, setPending] = useState<{ file: File; preview: string } | null>(null);
  const [alt, setAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useAdminUi((s) => s.toast);
  const qc = useQueryClient();
  const error = meta.touched ? meta.error : undefined;
  const id = `f-${name}`;

  // Free the local preview URL when the pending file changes or the field unmounts.
  useEffect(() => {
    if (!pending) return;
    return () => URL.revokeObjectURL(pending.preview);
  }, [pending]);

  const choose = (m: AdminMedia | null) => {
    setMedia(m);
    void helpers.setValue(m?.id ?? null);
    void helpers.setTouched(true, false);
  };

  async function upload() {
    if (!pending || !alt.trim()) return;
    setUploading(true);
    try {
      const saved = await uploadImage(pending.file, alt.trim());
      choose(saved);
      setPending(null);
      setAlt("");
      void qc.invalidateQueries({ queryKey: ["media"] });
      toast("success", "Image uploaded");
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-ink">
        {label}
        {required && <span className="text-[#b3261e]"> *</span>}
      </span>
      {help && <p className="m-0 -mt-1 text-[13px] text-ink-muted">{help}</p>}

      {media && !pending && (
        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-cream-50 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
          <img src={media.url} alt="" className="h-24 w-32 rounded object-cover" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
              Alt text
            </span>
            <span className="text-sm">{media.alt}</span>
          </div>
        </div>
      )}

      {pending ? (
        <div className="flex flex-col gap-3 rounded-lg border border-gold-500 bg-gold-500/5 p-3">
          <div className="flex flex-wrap items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- local preview of the chosen file */}
            <img src={pending.preview} alt="" className="h-24 w-32 rounded object-cover" />
            <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
              <label htmlFor={`${id}-alt`} className="text-sm font-semibold">
                Describe this photo <span className="text-[#b3261e]">*</span>
              </label>
              <input
                id={`${id}-alt`}
                value={alt}
                maxLength={200}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="e.g. Brass band leading a baraat at night in Gurugram"
                className={`${inputClasses(false)} min-h-11`}
              />
              <p className="m-0 text-[13px] text-ink-muted">
                Needed for visually impaired visitors and for Google Images.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <AdminButton
              variant="primary"
              size="sm"
              disabled={!alt.trim() || uploading}
              onClick={() => void upload()}
            >
              {uploading ? (
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <Upload aria-hidden="true" className="size-4" />
              )}
              {uploading ? "Uploading…" : "Upload"}
            </AdminButton>
            <AdminButton size="sm" disabled={uploading} onClick={() => setPending(null)}>
              Cancel
            </AdminButton>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <AdminButton size="sm" onClick={() => fileRef.current?.click()}>
            <Upload aria-hidden="true" className="size-4" />
            {media ? "Upload a different photo" : "Upload photo"}
          </AdminButton>
          <AdminButton size="sm" onClick={() => setLibraryOpen(true)}>
            <Library aria-hidden="true" className="size-4" />
            Choose from library
          </AdminButton>
          {media && !required && (
            <AdminButton size="sm" variant="ghost" onClick={() => choose(null)}>
              <Trash2 aria-hidden="true" className="size-4" />
              Remove
            </AdminButton>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) setPending({ file, preview: URL.createObjectURL(file) });
        }}
      />
      {error && <p className="m-0 text-[13px] font-medium text-[#b3261e]">{error}</p>}
      <MediaLibraryDialog
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onPick={choose}
      />
    </div>
  );
}
