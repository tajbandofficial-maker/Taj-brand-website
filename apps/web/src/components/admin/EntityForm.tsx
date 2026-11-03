"use client";

import { type FormikProps, FormikProvider } from "formik";
import { ExternalLink, Loader2, Save, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import { AdminButton, AdminLinkButton } from "./AdminButton";
import { ErrorState, LoadingState } from "./States";

type Props<V> = {
  formik: FormikProps<V>;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  cancelHref: string;
  /** Public URL to preview the item, when it has one. */
  viewHref?: string;
  onDelete?: () => void;
  deleting?: boolean;
  children: ReactNode;
};

/** Form frame: fields + sticky save bar (Save · Cancel · View on site · Delete). */
export function EntityForm<V>({
  formik,
  loading,
  error,
  onRetry,
  cancelHref,
  viewHref,
  onDelete,
  deleting,
  children,
}: Props<V>) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;

  return (
    <FormikProvider value={formik}>
      <form noValidate onSubmit={formik.handleSubmit} className="flex flex-col gap-5 pb-24">
        {children}
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 backdrop-blur lg:left-64">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
            <AdminButton type="submit" variant="primary" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? (
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <Save aria-hidden="true" className="size-4" />
              )}
              {formik.isSubmitting ? "Saving…" : "Save"}
            </AdminButton>
            <AdminLinkButton href={cancelHref}>Cancel</AdminLinkButton>
            {viewHref && (
              <AdminLinkButton href={viewHref} variant="ghost" external>
                <ExternalLink aria-hidden="true" className="size-4" />
                View on site
              </AdminLinkButton>
            )}
            {onDelete && (
              <AdminButton
                variant="danger"
                className="ml-auto"
                disabled={deleting}
                onClick={onDelete}
              >
                <Trash2 aria-hidden="true" className="size-4" />
                Delete
              </AdminButton>
            )}
          </div>
        </div>
      </form>
    </FormikProvider>
  );
}
