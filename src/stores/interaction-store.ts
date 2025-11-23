
import { create } from "zustand";
import stringToColor from "string-to-color";
import { v4 } from "uuid";

export interface InteractionStore {
  color: string;
  setColor: (color: string) => void;
}

export const useInteractionStore = create<InteractionStore>((set) => ({
  color: stringToColor(v4()),
  setColor: (color: string) => set({ color }),
}));
