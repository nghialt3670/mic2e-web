import { Canvas } from "fabric";
import { RefObject } from "react";
import { create } from "zustand";

export interface Reference {
  value: string;
  label: string;
  color: string;
}

export interface AttachmentInput {
  file: File;
  canvasRef?: RefObject<Canvas | null>;
}

export interface MessageInputStore {
  text: string;
  referenceMap: Record<string, Reference>;
  attachmentMap: Record<string, AttachmentInput>;
  setText: (text: string) => void;
  clearText: () => void;
  addReference: (reference: Reference) => void;
  removeReference: (reference: Reference) => void;
  getReferences: () => Reference[];
  setReferences: (references: Reference[]) => void;
  clearReferences: () => void;
  addAttachment: (attachment: AttachmentInput) => void;
  setAttachment: (attachment: AttachmentInput) => void;
  removeAttachment: (attachment: AttachmentInput) => void;
  getAttachments: () => AttachmentInput[];
  setAttachments: (attachments: AttachmentInput[]) => void;
  clearAttachments: () => void;
}

export const useMessageInputStore = create<MessageInputStore>((set, get) => ({
  text: "",
  referenceMap: {},
  attachmentMap: {},
  setText: (text: string) => set({ text }),
  clearText: () => set({ text: "" }),
  addReference: (reference: Reference) =>
    set({
      referenceMap: { ...get().referenceMap, [reference.value]: reference },
    }),
  removeReference: (reference: Reference) =>
    set({
      referenceMap: Object.fromEntries(
        Object.entries(get().referenceMap).filter(
          ([k]) => k !== reference.value,
        ),
      ),
    }),
  getReferences: () => Object.values(get().referenceMap),
  setReferences: (references: Reference[]) =>
    set({
      referenceMap: references.reduce(
        (acc, reference) => ({ ...acc, [reference.value]: reference }),
        {},
      ),
    }),
  clearReferences: () => set({ referenceMap: {} }),
  addAttachment: (attachment: AttachmentInput) =>
    set({
      attachmentMap: {
        ...get().attachmentMap,
        [attachment.file.name]: attachment,
      },
    }),
  setAttachment: (attachment: AttachmentInput) =>
    set({
      attachmentMap: {
        ...get().attachmentMap,
        [attachment.file.name]: attachment,
      },
    }),
  removeAttachment: (attachment: AttachmentInput) =>
    set({
      attachmentMap: Object.fromEntries(
        Object.entries(get().attachmentMap).filter(
          ([k]) => k !== attachment.file.name,
        ),
      ),
    }),
  getAttachments: () => Object.values(get().attachmentMap),
  setAttachments: (attachments: AttachmentInput[]) =>
    set({
      attachmentMap: attachments.reduce(
        (acc, attachment) => ({ ...acc, [attachment.file.name]: attachment }),
        {},
      ),
    }),
  clearAttachments: () => set({ attachmentMap: {} }),
}));
