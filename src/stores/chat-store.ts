import { Chat, ChatStatus } from "@/lib/drizzle/drizzle-schema";
import { create } from "zustand";

interface ChatStore {
  page: number;
  size: number;
  total: number;
  loading: boolean;
  chat?: Partial<Chat>;
  chats: Partial<Chat>[];
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  setChat: (chat?: Partial<Chat>) => void;
  addChat: (chat: Partial<Chat>) => void;
  setChats: (chats: Partial<Chat>[], total: number) => void;
  appendChats: (chats: Partial<Chat>[], total: number) => void;
  removeChat: (chatId: string) => void;
  updateChatTitle: (chatId: string, title?: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
  updateChatStatus: (status: ChatStatus) => void;
  hasMore: () => boolean;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  page: 1,
  size: 20,
  total: 0,
  loading: false,
  chat: undefined,
  chats: [],
  setPage: (page: number) => set({ page }),
  setSize: (size: number) => set({ size }),
  setChat: (chat?: Partial<Chat>) => set({ chat }),
  addChat: (chat: Partial<Chat>) =>
    set((state) => ({ chats: [...state.chats, chat] })),
  setChats: (chats: Partial<Chat>[], total: number) =>
    set({ chats, total, page: 1 }),
  appendChats: (chats: Partial<Chat>[], total: number) =>
    set((state) => ({
      chats: [...state.chats, ...chats],
      total,
      page: state.page + 1,
    })),
  removeChat: (chatId: string) =>
    set((state) => ({
      chats: state.chats.filter((chat) => chat.id !== chatId),
      total: Math.max(0, state.total - 1),
    })),
  updateChatTitle: (chatId: string, title?: string | null) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, title: title ?? undefined } : chat,
      ),
      chat:
        state.chat?.id === chatId
          ? { ...state.chat, title: title ?? undefined }
          : state.chat,
    })),
  setLoading: (loading: boolean) => set({ loading }),
  reset: () => set({ chats: [], page: 1, total: 0, loading: false }),
  updateChatStatus: (status: ChatStatus) =>
    set((state) => ({ chat: { ...state.chat, status } })),
  hasMore: () => {
    const state = get();
    return state.chats.length < state.total;
  },
}));
