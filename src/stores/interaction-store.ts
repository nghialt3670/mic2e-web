
import { create } from "zustand";
import stringToColor from "string-to-color";
import { v4 } from "uuid";

export type InteractionType = "none" | "box" | "point" | "image";

export interface InteractionStore {
  type: InteractionType;
  color: string;
  setType: (type: InteractionType) => void;
  setColor: (color: string) => void;
}

export const useInteractionStore = create<InteractionStore>((set) => ({
  type: "none",
  color: stringToColor(v4()),
  setType: (type: InteractionType) => set({ type }),
  setColor: (color: string) => set({ color }),
}));
