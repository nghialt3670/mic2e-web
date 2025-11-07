import { create } from "zustand";

export type InteractionMode = "none" | "box" | "point" | "image";

export interface InteractionModeStore {
  mode: InteractionMode;
  targetAttachmentId: string | null;
  activeTagId: string | null;
  activeTagColor: string | null;
  setMode: (
    mode: InteractionMode,
    targetAttachmentId?: string | null,
    tagId?: string | null,
    tagColor?: string | null
  ) => void;
  clearMode: () => void;
}

export const useInteractionModeStore = create<InteractionModeStore>(
  (set) => ({
    mode: "none",
    targetAttachmentId: null,
    activeTagId: null,
    activeTagColor: null,
    setMode: (mode, targetAttachmentId = null, tagId = null, tagColor = null) =>
      set({ mode, targetAttachmentId, activeTagId: tagId, activeTagColor: tagColor }),
    clearMode: () => set({ mode: "none", targetAttachmentId: null, activeTagId: null, activeTagColor: null }),
  })
);

