import { emptyInquiryForm, type InquiryFormValues } from "@taj/types/inquiry";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** The visitor-editable part of the form (hidden/system fields are excluded). */
export type InquiryDraft = Pick<
  InquiryFormValues,
  "name" | "phone" | "email" | "weddingDate" | "venue" | "services" | "message"
>;

type InquiryState = {
  draft: InquiryDraft;
  /** Merge field changes into the draft. */
  saveDraft: (patch: Partial<InquiryDraft>) => void;
  clearDraft: () => void;
};

const emptyDraft: InquiryDraft = {
  name: emptyInquiryForm.name,
  phone: emptyInquiryForm.phone,
  email: emptyInquiryForm.email,
  weddingDate: emptyInquiryForm.weddingDate,
  venue: emptyInquiryForm.venue,
  services: [],
  message: emptyInquiryForm.message,
};

export function isDraftEmpty(d: InquiryDraft): boolean {
  return (
    !d.name &&
    !d.phone &&
    !d.email &&
    !d.weddingDate &&
    !d.venue &&
    !d.message &&
    d.services.length === 0
  );
}

/**
 * Inquiry draft shared by every inquiry form on the site and kept in
 * sessionStorage, so a half-filled form survives navigating between pages.
 * `skipHydration` keeps SSR and the first client render identical; forms call
 * `useInquiryStore.persist.rehydrate()` after mount.
 */
export const useInquiryStore = create<InquiryState>()(
  persist(
    (set) => ({
      draft: emptyDraft,
      saveDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
      clearDraft: () => set({ draft: emptyDraft }),
    }),
    {
      name: "taj-inquiry-draft",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      version: 1,
    },
  ),
);
