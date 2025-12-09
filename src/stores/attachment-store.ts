import { Attachment } from "@/lib/drizzle/drizzle-schema";
import { create } from "zustand";

export interface AttachmentStore {
  attachmentMap: Record<string, Attachment>;
  setAttachment: (key: string, attachment: Attachment) => void;
  getAttachment: (key: string) => Attachment;
  setAttachments: (keys: string[], attachments: Attachment[]) => void;
  getAttachments: () => Attachment[];
  removeAttachment: (key: string) => void;
  clearAttachments: () => void;
}

export const useAttachmentStore = create<AttachmentStore>((set, get) => ({
  attachmentMap: {},
  setAttachment: (key: string, attachment: Attachment) =>
    set({ attachmentMap: { ...get().attachmentMap, [key]: attachment } }),
  getAttachment: (key: string) => get().attachmentMap[key],
  setAttachments: (keys: string[], attachments: Attachment[]) =>
    set({
      attachmentMap: keys.reduce(
        (acc, key, index) => ({ ...acc, [key]: attachments[index] }),
        get().attachmentMap,
      ),
    }),
  getAttachments: () => Object.values(get().attachmentMap),
  removeAttachment: (key: string) =>
    set({
      attachmentMap: Object.fromEntries(
        Object.entries(get().attachmentMap).filter(([k]) => k !== key),
      ),
    }),
  clearAttachments: () => set({ attachmentMap: {} }),
}));
