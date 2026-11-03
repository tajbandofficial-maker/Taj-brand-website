"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { bff } from "./api";

/** Admin resources exposed by the API under /admin/<resource>. */
export type Resource =
  | "pages"
  | "services"
  | "packages"
  | "addons"
  | "comparison"
  | "gallery"
  | "reviews"
  | "faqs"
  | "inquiries"
  | "media";

export function useList<T>(resource: Resource, query = "") {
  return useQuery({
    queryKey: [resource, "list", query],
    queryFn: () => bff<T[]>(`${resource}${query ? `?${query}` : ""}`),
  });
}

export function useItem<T>(resource: Resource, id: string | undefined) {
  return useQuery({
    queryKey: [resource, "item", id],
    queryFn: () => bff<T>(`${resource}/${id}`),
    enabled: Boolean(id),
  });
}

/** Create (no id) or update (id) — then refresh that resource's queries. */
export function useSave<T>(resource: Resource) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: unknown }) =>
      bff<T>(id ? `${resource}/${id}` : resource, { method: id ? "PATCH" : "POST", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resource] }),
  });
}

export function useRemove(resource: Resource) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bff<{ id: string }>(`${resource}/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resource] }),
  });
}

export function useReorder(resource: Resource) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      bff<{ ok: true }>(`${resource}/reorder`, { method: "PATCH", body: { ids } }),
    onSettled: () => qc.invalidateQueries({ queryKey: [resource, "list"] }),
  });
}

/** Singleton settings. */
export function useSettings<T>() {
  return useQuery({ queryKey: ["settings"], queryFn: () => bff<T>("settings") });
}

export function useSaveSettings<T>() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => bff<T>("settings", { method: "PATCH", body: data }),
    onSuccess: (saved) => qc.setQueryData(["settings"], saved),
  });
}
