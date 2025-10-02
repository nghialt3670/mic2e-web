import { Message } from "@/lib/drizzle/schema";
import { create } from "zustand";

interface ChatStore {
  chatId: string | undefined;
  messages: Partial<Message>[];
  addMessage: (message: Partial<Message>) => void;
  setChatId: (chatId: string | undefined) => void;
  setMessages: (messages: Partial<Message>[]) => void;
  clearMessages: () => void;
}

const useChatStore = create<ChatStore>((set) => ({
  chatId: undefined,
  messages: [],
  setChatId: (chatId: string | undefined) => set({ chatId }),
  setMessages: (messages: Partial<Message>[]) => set({ messages }),
  addMessage: (message: Partial<Message>) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
}));

export default useChatStore;
