import { Message } from "@/lib/drizzle/schema";
import { create } from "zustand";

interface ChatStore {
  chatId: string | undefined;
  messages: Message[];
  addMessage: (message: Message) => void;
  setChatId: (chatId: string | undefined) => void;
  setMessages: (messages: Message[]) => void;
  clearMessages: () => void;
}

const useChatStore = create<ChatStore>((set) => ({
  chatId: undefined,
  messages: [],
  setChatId: (chatId: string | undefined) => set({ chatId }),
  setMessages: (messages: Message[]) => set({ messages }),
  addMessage: (message: Message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
}));

export default useChatStore;
