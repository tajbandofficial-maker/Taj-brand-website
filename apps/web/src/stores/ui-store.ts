import { create } from "zustand";

type UiState = {
  /** Mobile navigation panel (< 860px). */
  navOpen: boolean;
  toggleNav: () => void;
  closeNav: () => void;

  /**
   * Page-aware WhatsApp message for the floating button and mobile bar. Pages set it via
   * <PageWhatsAppMessage />; null falls back to the site default.
   */
  whatsappMessage: string | null;
  setWhatsappMessage: (message: string | null) => void;
};

export const useUiStore = create<UiState>()((set) => ({
  navOpen: false,
  toggleNav: () => set((s) => ({ navOpen: !s.navOpen })),
  closeNav: () => set({ navOpen: false }),

  whatsappMessage: null,
  setWhatsappMessage: (whatsappMessage) => set({ whatsappMessage }),
}));
