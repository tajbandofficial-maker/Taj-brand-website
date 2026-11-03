"use client";

import type { AdminComparisonRow, AdminPackage } from "@taj/types";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ExternalLink, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";

import { bff } from "@/lib/admin/api";
import { useList, useReorder } from "@/lib/admin/queries";
import { useAdminUi } from "@/stores/admin-ui-store";

import { AdminButton, AdminLinkButton } from "../AdminButton";
import { inputClasses } from "../fields/FieldShell";
import { PageHeader } from "../PageHeader";
import { EmptyState, ErrorState, LoadingState } from "../States";

type Draft = { id?: string; label: string; values: string[] };

/** One-tap values: typing ✓ or — is awkward on most keyboards. */
const QUICK_VALUES = [
  { value: "✓", label: "Included" },
  { value: "—", label: "Not included" },
];

const sameRows = (a: Draft[], b: Draft[]) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Editor for the /packages comparison table: one card per feature row, with a
 * labelled box per published package (in package order).
 */
export function ComparisonEditor() {
  const rows = useList<AdminComparisonRow>("comparison");
  const packages = useList<AdminPackage>("packages");
  const reorder = useReorder("comparison");
  const qc = useQueryClient();
  const toast = useAdminUi((s) => s.toast);
  const confirm = useAdminUi((s) => s.confirm);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [saved, setSaved] = useState<Draft[]>([]);
  const [saving, setSaving] = useState(false);
  // Set by "Save table" so the reload replaces drafts (new rows get their server ids).
  const [resetOnLoad, setResetOnLoad] = useState(true);

  const columns = (packages.data ?? []).filter((p) => p.published);
  const dirty = !sameRows(drafts, saved);

  // Fresh server rows become the saved baseline; they replace the drafts only after a
  // save or when nothing is unsaved, so a delete/reorder never wipes other edits.
  const [loadedRows, setLoadedRows] = useState<AdminComparisonRow[] | undefined>(undefined);
  if (rows.data !== loadedRows) {
    setLoadedRows(rows.data);
    if (rows.data) {
      const fresh = rows.data.map((r) => ({ id: r.id, label: r.label, values: r.values }));
      setSaved(fresh);
      if (resetOnLoad || !dirty) {
        setDrafts(fresh);
        setResetOnLoad(false);
      }
    }
  }

  const update = (i: number, patch: Partial<Draft>) =>
    setDrafts((d) => d.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  const setValue = (i: number, c: number, value: string) =>
    setDrafts((d) =>
      d.map((row, j) => {
        if (j !== i) return row;
        const values = columns.map((_, k) => row.values[k] ?? "");
        values[c] = value;
        return { ...row, values };
      }),
    );

  async function saveAll() {
    setSaving(true);
    try {
      for (const d of drafts) {
        const body = {
          label: d.label.trim(),
          values: columns.map((_, c) => (d.values[c] ?? "").trim() || "—"),
        };
        if (!body.label) continue;
        await bff(d.id ? `comparison/${d.id}` : "comparison", {
          method: d.id ? "PATCH" : "POST",
          body,
        });
      }
      setResetOnLoad(true);
      await qc.invalidateQueries({ queryKey: ["comparison"] });
      toast("success", "Comparison table saved — the Packages page updates within seconds");
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function removeRow(i: number) {
    const d = drafts[i]!;
    const ok = await confirm({
      title: "Delete row?",
      message: `“${d.label || "Untitled"}” will be removed from the comparison table.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    setDrafts((all) => all.filter((_, j) => j !== i));
    if (d.id) {
      await bff(`comparison/${d.id}`, { method: "DELETE" });
      await qc.invalidateQueries({ queryKey: ["comparison"] });
      toast("success", "Row deleted");
    }
  }

  function move(i: number, dir: -1 | 1) {
    const next = [...drafts];
    [next[i], next[i + dir]] = [next[i + dir]!, next[i]!];
    setDrafts(next);
    const ids = next.map((d) => d.id).filter((id): id is string => Boolean(id));
    reorder.mutate(ids, { onError: (e) => toast("error", e.message) });
  }

  if (rows.isLoading || packages.isLoading) return <LoadingState />;
  if (rows.error || packages.error) return <ErrorState error={rows.error ?? packages.error} />;

  return (
    <>
      <PageHeader
        title="Package comparison"
        description={
          <>
            The “Compare packages” table on the Packages page: one card per row, one box per
            package. Use <b>✓</b> for included and <b>—</b> for not included, or type a value such
            as “15 men”. Columns follow your published packages, in their order on the Packages
            screen.
          </>
        }
        back={{ href: "/admin/packages", label: "All packages" }}
      />

      {columns.length === 0 && (
        <EmptyState title="No published packages">
          Publish a package first — each one becomes a column here.
        </EmptyState>
      )}
      {columns.length > 0 && drafts.length === 0 && (
        <EmptyState title="No rows yet">Add the first feature row below.</EmptyState>
      )}

      <ol className="m-0 flex list-none flex-col gap-4 p-0 pb-24">
        {drafts.map((d, i) => (
          <li
            key={d.id ?? `new-${i}`}
            className="flex flex-col gap-4 rounded-xl border border-line bg-white p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex min-w-0 flex-[1_1_260px] flex-col gap-1.5">
                <span className="text-sm font-semibold">
                  Row {i + 1} · Feature <span className="text-[#b3261e]">*</span>
                </span>
                <input
                  value={d.label}
                  maxLength={80}
                  placeholder="e.g. Dhol players"
                  onChange={(e) => update(i, { label: e.target.value })}
                  className={`${inputClasses(!d.label.trim())} min-h-11 font-semibold`}
                />
              </label>
              <div className="flex gap-1">
                <AdminButton
                  size="sm"
                  variant="ghost"
                  aria-label={`Move “${d.label}” up`}
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp aria-hidden="true" className="size-4" />
                </AdminButton>
                <AdminButton
                  size="sm"
                  variant="ghost"
                  aria-label={`Move “${d.label}” down`}
                  disabled={i === drafts.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown aria-hidden="true" className="size-4" />
                </AdminButton>
                <AdminButton
                  size="sm"
                  variant="ghost"
                  aria-label={`Delete “${d.label}”`}
                  onClick={() => void removeRow(i)}
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </AdminButton>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {columns.map((p, c) => {
                const value = d.values[c] ?? "";
                return (
                  <div key={p.id} className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold tracking-wide text-ink-muted uppercase">
                      {p.name}
                    </span>
                    <div className="flex gap-1.5">
                      <input
                        aria-label={`${d.label || "Feature"} — ${p.name}`}
                        value={value}
                        maxLength={80}
                        placeholder="—"
                        onChange={(e) => setValue(i, c, e.target.value)}
                        className={`${inputClasses(false)} min-h-10 min-w-0 flex-1`}
                      />
                      {QUICK_VALUES.map((q) => (
                        <button
                          key={q.value}
                          type="button"
                          title={q.label}
                          aria-label={`${q.label}: ${d.label || "Feature"} — ${p.name}`}
                          aria-pressed={value === q.value}
                          onClick={() => setValue(i, c, q.value)}
                          className={`size-10 shrink-0 cursor-pointer rounded-lg border text-base font-bold transition-colors ${
                            value === q.value
                              ? "border-cocoa-900 bg-cocoa-900 text-cream-50"
                              : "border-sand-300 bg-white text-ink hover:border-gold-500"
                          }`}
                        >
                          {q.value}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </li>
        ))}
      </ol>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
          <AdminButton variant="primary" disabled={saving || !dirty} onClick={() => void saveAll()}>
            {saving ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Save aria-hidden="true" className="size-4" />
            )}
            {saving ? "Saving…" : "Save table"}
          </AdminButton>
          <AdminButton
            disabled={columns.length === 0}
            onClick={() =>
              setDrafts((all) => [...all, { label: "", values: columns.map(() => "—") }])
            }
          >
            <Plus aria-hidden="true" className="size-4" />
            Add row
          </AdminButton>
          <AdminLinkButton href="/packages" variant="ghost" external>
            <ExternalLink aria-hidden="true" className="size-4" />
            View on site
          </AdminLinkButton>
          <span
            role="status"
            className={`ml-auto text-sm font-semibold ${dirty ? "text-gold-700" : "text-ink-muted"}`}
          >
            {dirty ? "Unsaved changes" : "All changes saved"}
          </span>
        </div>
      </div>
    </>
  );
}
