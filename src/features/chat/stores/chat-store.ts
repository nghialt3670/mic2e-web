import { Chat, ChatStatus } from "@/lib/drizzle/drizzle-schema";
import { create } from "zustand";

interface ChatStore {
  page: number;
  size: number;
  chat?: Partial<Chat>;
  chats: Partial<Chat>[];
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  setChat: (chat?: Partial<Chat>) => void;
  addChat: (chat: Partial<Chat>) => void;
  setChats: (chats: Partial<Chat>[]) => void;
  updateChatStatus: (status: ChatStatus) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  page: 1,
  size: 20,
  chat: undefined,
  chats: [],
  setPage: (page: number) => set({ page }),
  setSize: (size: number) => set({ size }),
  setChat: (chat?: Partial<Chat>) => set({ chat }),
  addChat: (chat: Partial<Chat>) =>
    set((state) => ({ chats: [...state.chats, chat] })),
  setChats: (chats: Partial<Chat>[]) => set({ chats }),
  updateChatStatus: (status: ChatStatus) =>
    set((state) => ({ chat: { ...state.chat, status } })),
}));
