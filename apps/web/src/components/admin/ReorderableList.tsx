"use client";

import { ArrowDown, ArrowUp, GripVertical, Pencil } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";

import { cn } from "@/lib/cn";

export type Column<T> = { header: string; cell: (item: T) => ReactNode; className?: string };

type Props<T extends { id: string }> = {
  items: T[];
  columns: Column<T>[];
  editHref: (item: T) => string;
  /** Called with the full id order after a move; omit to disable reordering. */
  onReorder?: (ids: string[]) => void;
  reorderHint?: string;
};

/**
 * List with drag-and-drop (mouse) and up/down buttons (keyboard/touch) to set
 * the order items appear on the website.
 */
export function ReorderableList<T extends { id: string }>({
  items,
  columns,
  editHref,
  onReorder,
  reorderHint,
}: Props<T>) {
  const [order, setOrder] = useState(items);
  const [dragId, setDragId] = useState<string | null>(null);
  // Reset local order when fresh data arrives (React's "adjust state on prop change" pattern).
  const [prevItems, setPrevItems] = useState(items);
  if (items !== prevItems) {
    setPrevItems(items);
    setOrder(items);
  }

  const commit = (next: T[]) => {
    setOrder(next);
    onReorder?.(next.map((i) => i.id));
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length || from === to) return;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    commit(next);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      {onReorder && (
        <p className="m-0 border-b border-line bg-cream-50 px-4 py-2 text-[13px] text-ink-muted">
          {reorderHint ?? "Drag rows (or use the arrows) to change the order on the website."}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-[15px]">
          <thead>
            <tr className="text-left text-xs tracking-wide text-ink-muted uppercase">
              {onReorder && <th className="w-24 px-3 py-2.5 font-semibold">Order</th>}
              {columns.map((c) => (
                <th key={c.header} className={cn("px-3 py-2.5 font-semibold", c.className)}>
                  {c.header}
                </th>
              ))}
              <th className="w-20 px-3 py-2.5">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {order.map((item, i) => (
              <tr
                key={item.id}
                draggable={Boolean(onReorder)}
                onDragStart={() => setDragId(item.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => onReorder && e.preventDefault()}
                onDrop={() => {
                  const from = order.findIndex((o) => o.id === dragId);
                  if (from !== -1) move(from, i);
                }}
                className={cn(
                  "border-t border-line align-middle",
                  dragId === item.id && "opacity-50",
                )}
              >
                {onReorder && (
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-0.5">
                      <GripVertical
                        aria-hidden="true"
                        className="size-4 cursor-grab text-sand-400"
                      />
                      <button
                        type="button"
                        aria-label="Move up"
                        disabled={i === 0}
                        onClick={() => move(i, i - 1)}
                        className="flex size-8 cursor-pointer items-center justify-center rounded text-ink-muted hover:bg-cream-100 disabled:opacity-30"
                      >
                        <ArrowUp aria-hidden="true" className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Move down"
                        disabled={i === order.length - 1}
                        onClick={() => move(i, i + 1)}
                        className="flex size-8 cursor-pointer items-center justify-center rounded text-ink-muted hover:bg-cream-100 disabled:opacity-30"
                      >
                        <ArrowDown aria-hidden="true" className="size-4" />
                      </button>
                    </div>
                  </td>
                )}
                {columns.map((c) => (
                  <td key={c.header} className={cn("px-3 py-2", c.className)}>
                    {c.cell(item)}
                  </td>
                ))}
                <td className="px-3 py-2 text-right">
                  <Link
                    href={editHref(item)}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-gold-700 hover:bg-cream-100"
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
