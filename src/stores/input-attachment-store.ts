import { AttachmentType } from "@/lib/drizzle/drizzle-schema";
import { create } from "zustand";

export interface InputAttachment {
  type: AttachmentType;
  figObject: Record<string, any>;
  imageFile: File;
}

export interface InputAttachmentStore {
  inputAttachmentMap: Record<string, InputAttachment>;
  setInputAttachment: (key: string, attachment: InputAttachment) => void;
  getInputAttachment: (key: string) => InputAttachment;
  setInputAttachments: (keys: string[], attachments: InputAttachment[]) => void;
  getInputAttachments: () => InputAttachment[];
  removeInputAttachment: (key: string) => void;
  clearInputAttachments: () => void;
}

export const useInputAttachmentStore = create<InputAttachmentStore>(
  (set, get) => ({
    inputAttachmentMap: {},
    setInputAttachment: (key: string, attachment: InputAttachment) =>
      set({
        inputAttachmentMap: { ...get().inputAttachmentMap, [key]: attachment },
      }),
    getInputAttachment: (key: string) => get().inputAttachmentMap[key],
    setInputAttachments: (keys: string[], attachments: InputAttachment[]) =>
      set({
        inputAttachmentMap: keys.reduce(
          (acc, key, index) => ({ ...acc, [key]: attachments[index] }),
          get().inputAttachmentMap,
        ),
      }),
    getInputAttachments: () => Object.values(get().inputAttachmentMap),
    removeInputAttachment: (key: string) =>
      set({
        inputAttachmentMap: Object.fromEntries(
          Object.entries(get().inputAttachmentMap).filter(([k]) => k !== key),
        ),
      }),
    clearInputAttachments: () => set({ inputAttachmentMap: {} }),
  }),
);
