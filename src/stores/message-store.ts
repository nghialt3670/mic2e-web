import { create } from "zustand";

import { MessageDetail } from "../types";

interface MessageStore {
  page: number;
  size: number;
  messages: MessageDetail[];
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  addMessage: (message: MessageDetail) => void;
  updateMessage: (id: string, message: MessageDetail) => void;
  removeMessage: (id: string) => void;
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
  updateMessage: (id: string, message: MessageDetail) =>
    set((state) => ({
      messages: state.messages.map((existing) =>
        existing.id === id ? message : existing,
      ),
    })),
  removeMessage: (id: string) =>
    set((state) => ({
      messages: state.messages.filter((message) => message.id !== id),
    })),
  clearMessages: () => set({ messages: [] }),
}));
