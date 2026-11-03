"use client";

import { Plus } from "lucide-react";
import type { ReactNode } from "react";

import { type Resource, useList, useReorder } from "@/lib/admin/queries";
import { useAdminUi } from "@/stores/admin-ui-store";

import { AdminLinkButton } from "./AdminButton";
import { PageHeader } from "./PageHeader";
import { type Column, ReorderableList } from "./ReorderableList";
import { EmptyState, ErrorState, LoadingState } from "./States";

type Props<T extends { id: string }> = {
  resource: Resource;
  title: string;
  description: ReactNode;
  newLabel: string;
  columns: Column<T>[];
  reorderable?: boolean;
  /** Extra content above the list (filters, notes, links). */
  toolbar?: ReactNode;
  query?: string;
  filter?: (item: T) => boolean;
  emptyTitle: string;
};

/** Standard admin list: header + "Add" button + reorderable table. */
export function ListScreen<T extends { id: string }>({
  resource,
  title,
  description,
  newLabel,
  columns,
  reorderable = true,
  toolbar,
  query,
  filter,
  emptyTitle,
}: Props<T>) {
  const list = useList<T>(resource, query);
  const reorder = useReorder(resource);
  const toast = useAdminUi((s) => s.toast);
  const items = filter ? (list.data ?? []).filter(filter) : (list.data ?? []);

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <AdminLinkButton href={`/admin/${resource}/new`} variant="primary">
            <Plus aria-hidden="true" className="size-4" />
            {newLabel}
          </AdminLinkButton>
        }
      />
      {toolbar}
      {list.isLoading && <LoadingState />}
      {list.error && <ErrorState error={list.error} onRetry={() => void list.refetch()} />}
      {list.data && items.length === 0 && <EmptyState title={emptyTitle} />}
      {items.length > 0 && (
        <ReorderableList
          items={items}
          columns={columns}
          editHref={(item) => `/admin/${resource}/${item.id}`}
          onReorder={
            reorderable && !filter
              ? (ids) =>
                  reorder.mutate(ids, {
                    onSuccess: () => toast("success", "Order saved"),
                    onError: (e) => toast("error", e.message),
                  })
              : undefined
          }
        />
      )}
    </>
  );
}
