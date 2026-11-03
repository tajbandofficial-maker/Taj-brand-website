import { create } from "zustand";

export type Toast = { id: number; kind: "success" | "error"; message: string };

type ConfirmRequest = {
  title: string;
  message: string;
  confirmLabel: string;
  danger: boolean;
  resolve: (ok: boolean) => void;
};

type AdminUiState = {
  toasts: Toast[];
  toast: (kind: Toast["kind"], message: string) => void;
  dismiss: (id: number) => void;

  confirmRequest: ConfirmRequest | null;
  /** Promise-based confirm dialog: `if (await confirm({...})) remove()`. */
  confirm: (opts: {
    title: string;
    message: string;
    confirmLabel?: string;
    danger?: boolean;
  }) => Promise<boolean>;
  settleConfirm: (ok: boolean) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

let nextId = 1;

/** UI state for the admin panel: toasts, confirm dialog, mobile sidebar. */
export const useAdminUi = create<AdminUiState>()((set, get) => ({
  toasts: [],
  toast: (kind, message) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, kind, message }] }));
    setTimeout(() => get().dismiss(id), kind === "error" ? 7000 : 3500);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  confirmRequest: null,
  confirm: ({ title, message, confirmLabel = "Confirm", danger = false }) =>
    new Promise<boolean>((resolve) => {
      get().confirmRequest?.resolve(false);
      set({ confirmRequest: { title, message, confirmLabel, danger, resolve } });
    }),
  settleConfirm: (ok) => {
    get().confirmRequest?.resolve(ok);
    set({ confirmRequest: null });
  },

  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
