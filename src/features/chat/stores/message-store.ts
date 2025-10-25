import { Attachment, Message, Thumbnail } from "@/lib/drizzle/drizzle-schema";
import { create } from "zustand";


interface AttachmentWithThumbnail extends Attachment {
  thumbnail?: Thumbnail;
}
interface MessageWithAttachments extends Message {
  attachments?: AttachmentWithThumbnail[];
}
interface MessageStore {
  page: number;
  size: number;
  messages: MessageWithAttachments[];
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  addMessage: (message: MessageWithAttachments) => void;
  setMessages: (messages: MessageWithAttachments[]) => void;
  clearMessages: () => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  page: 1,
  size: 20,
  messages: [],
  setPage: (page: number) => set({ page }),
  setSize: (size: number) => set({ size }),
  setMessages: (messages: MessageWithAttachments[]) => set({ messages }),
  addMessage: (message: MessageWithAttachments) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
}));
