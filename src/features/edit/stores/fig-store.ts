import { create } from "zustand";

interface FigStore {
  figObjectMap: Record<string, Record<string, any>>;
  setFigObject: (key: string, figObject: Record<string, any>) => void;
  getFigObject: (key: string) => Record<string, any>;
  removeFigObject: (key: string) => void;
  setFigObjects: (keys: string[], figObjects: Record<string, any>[]) => void;
  getFigObjects: () => Record<string, any>[];
}

export const useFigStore = create<FigStore>((set, get) => ({
  figObjectMap: {},
  setFigObject: (key: string, figObject: Record<string, any>) =>
    set((state) => ({
      figObjectMap: { ...state.figObjectMap, [key]: figObject },
    })),
  getFigObject: (key: string) => get().figObjectMap[key],
  removeFigObject: (key: string) =>
    set((state) => ({
      figObjectMap: Object.fromEntries(
        Object.entries(state.figObjectMap).filter(([k]) => k !== key),
      ),
    })),
  setFigObjects: (keys: string[], figObjects: Record<string, any>[]) =>
    set((state) => ({
      figObjectMap: keys.reduce(
        (acc, key, index) => ({ ...acc, [key]: figObjects[index] }),
        state.figObjectMap,
      ),
    })),
  getFigObjects: () => Object.values(get().figObjectMap),
}));
