import { Message } from "@/lib/drizzle/drizzle-schema";
import { create } from "zustand";

interface MessageStore {
  page: number;
  size: number;
  messages: Partial<Message>[];
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  addMessage: (message: Partial<Message>) => void;
  setMessages: (messages: Partial<Message>[]) => void;
  clearMessages: () => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  page: 1,
  size: 20,
  messages: [],
  setPage: (page: number) => set({ page }),
  setSize: (size: number) => set({ size }),
  setMessages: (messages: Partial<Message>[]) => set({ messages }),
  addMessage: (message: Partial<Message>) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
}));
