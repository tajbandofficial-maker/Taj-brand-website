"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

import { ConfirmDialog } from "./ConfirmDialog";
import { Toaster } from "./Toaster";

/** Client providers for the admin area only (never loaded on public pages). */
export function AdminProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
          mutations: { retry: 0 },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster />
      <ConfirmDialog />
    </QueryClientProvider>
  );
}
