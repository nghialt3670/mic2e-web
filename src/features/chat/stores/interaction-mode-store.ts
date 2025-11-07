import { create } from "zustand";

export type InteractionMode = "none" | "box" | "point" | "image";

export interface InteractionModeStore {
  mode: InteractionMode;
  targetAttachmentId: string | null;
  setMode: (mode: InteractionMode, targetAttachmentId?: string | null) => void;
  clearMode: () => void;
}

export const useInteractionModeStore = create<InteractionModeStore>(
  (set) => ({
    mode: "none",
    targetAttachmentId: null,
    setMode: (mode, targetAttachmentId = null) =>
      set({ mode, targetAttachmentId }),
    clearMode: () => set({ mode: "none", targetAttachmentId: null }),
  })
);

