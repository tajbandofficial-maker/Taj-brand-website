import type { GalleryCategory } from "@taj/types";
import { create } from "zustand";

export type GalleryFilter = GalleryCategory | "ALL";

type GalleryState = {
  filter: GalleryFilter;
  setFilter: (filter: GalleryFilter) => void;

  /** Index into the currently filtered list; null when the lightbox is closed. */
  lightboxIndex: number | null;
  openLightbox: (index: number) => void;
  closeLightbox: () => void;
};

export const useGalleryStore = create<GalleryState>()((set) => ({
  filter: "ALL",
  setFilter: (filter) => set({ filter, lightboxIndex: null }),

  lightboxIndex: null,
  openLightbox: (lightboxIndex) => set({ lightboxIndex }),
  closeLightbox: () => set({ lightboxIndex: null }),
}));
