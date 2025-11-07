import { create } from "zustand";
import { ChatCycleDetail } from "../types";

interface ChatCycleStore {
  page: number;
  size: number;
  chatCycles: ChatCycleDetail[];
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  setChatCycles: (chatCycles: ChatCycleDetail[]) => void;
  addChatCycle: (chatCycle: ChatCycleDetail) => void;
  clearChatCycles: () => void;
}

export const useChatCycleStore = create<ChatCycleStore>((set) => ({
  page: 1,
  size: 20,
  chatCycles: [],
  setPage: (page: number) => set({ page }),
  setSize: (size: number) => set({ size }),
  setChatCycles: (chatCycles: ChatCycleDetail[]) => set({ chatCycles }),
  addChatCycle: (chatCycle: ChatCycleDetail) => set((state) => ({ chatCycles: [...state.chatCycles, chatCycle] })),
  clearChatCycles: () => set({ chatCycles: [] }),
}));