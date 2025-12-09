import { create } from "zustand";

export type FigObject = Record<string, any>;

export interface FigObjectStore {
  figObjectMap: Record<string, Record<string, any>>;
  setFigObject: (key: string, figObject: Record<string, any>) => void;
  getFigObject: (key: string) => Record<string, any>;
  setFigObjects: (keys: string[], figObjects: Record<string, any>[]) => void;
  getFigObjects: () => Record<string, any>[];
  removeFigObject: (key: string) => void;
  clearFigObjects: () => void;
}

export const useFigObjectStore = create<FigObjectStore>((set, get) => ({
  figObjectMap: {},
  setFigObject: (key: string, figObject: Record<string, any>) =>
    set({ figObjectMap: { ...get().figObjectMap, [key]: figObject } }),
  getFigObject: (key: string) => get().figObjectMap[key],
  setFigObjects: (keys: string[], figObjects: Record<string, any>[]) =>
    set({
      figObjectMap: keys.reduce(
        (acc, key, index) => ({ ...acc, [key]: figObjects[index] }),
        get().figObjectMap,
      ),
    }),
  getFigObjects: () => Object.values(get().figObjectMap),
  removeFigObject: (key: string) =>
    set({
      figObjectMap: Object.fromEntries(
        Object.entries(get().figObjectMap).filter(([k]) => k !== key),
      ),
    }),
  clearFigObjects: () => set({ figObjectMap: {} }),
}));
