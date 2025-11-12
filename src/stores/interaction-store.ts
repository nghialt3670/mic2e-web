import {
  LucideIcon,
  MousePointerClick,
  SquareDashedMousePointer,
  SquareMousePointer,
} from "lucide-react";
import { SuggestionDataItem } from "react-mentions";
import stringToColor from "string-to-color";
import { v4 } from "uuid";
import { create } from "zustand";

export type InteractionType = "none" | "box" | "point" | "image";

interface ReferenceOption extends SuggestionDataItem {
  type: InteractionType;
  icon: LucideIcon;
  description: string;
}

export interface InteractionReference {
  id: string;
  type: InteractionType;
  color: string;
  options: ReferenceOption[];
}

export interface InteractionStore {
  referenceStack: InteractionReference[];
  getCurrentReference: () => InteractionReference;
  updateCurrentType: (type: InteractionType) => void;
  addReference: () => void;
  removeReference: (id: string) => void;
  getReferences: () => InteractionReference[];
  clearReferences: () => void;
}

const createReference = (): InteractionReference => {
  const id = v4();
  const color = stringToColor(id);
  return {
    id,
    type: "none",
    color,
    options: [
      {
        id: v4(),
        display: "box",
        type: "box",
        icon: SquareDashedMousePointer,
        description: "Draw a bounding box on the image",
      },
      {
        id: v4(),
        display: "point",
        type: "point",
        icon: MousePointerClick,
        description: "Mark a point on the image",
      },
      {
        id: v4(),
        display: "image",
        type: "image",
        icon: SquareMousePointer,
        description: "Select an image",
      },
    ],
  };
};

export const useInteractionStore = create<InteractionStore>((set, get) => ({
  referenceStack: [createReference()],
  getCurrentReference: () =>
    get().referenceStack[get().referenceStack.length - 1],
  updateCurrentType: (type: InteractionType) =>
    set((state) => ({
      referenceStack: state.referenceStack.map((reference) =>
        reference.id ===
        state.referenceStack[state.referenceStack.length - 1].id
          ? { ...reference, type }
          : reference,
      ),
    })),
  addReference: () =>
    set((state) => ({
      referenceStack: [...state.referenceStack, createReference()],
    })),
  removeReference: (id) =>
    set((state) => ({
      referenceStack: state.referenceStack.filter(
        (reference) => reference.id !== id,
      ),
    })),
  getReferences: () => get().referenceStack,
  clearReferences: () => set({ referenceStack: [createReference()] }),
}));
