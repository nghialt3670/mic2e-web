import { MessageDetail } from "../types";
import { create } from "zustand";

interface MessageStore {
  page: number;
  size: number;
  messages: MessageDetail[];
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  addMessage: (message: MessageDetail) => void;
  setMessages: (messages: MessageDetail[]) => void;
  clearMessages: () => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  page: 1,
  size: 20,
  messages: [],
  setPage: (page: number) => set({ page }),
  setSize: (size: number) => set({ size }),
  setMessages: (messages: MessageDetail[]) => set({ messages }),
  addMessage: (message: MessageDetail) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
}));
