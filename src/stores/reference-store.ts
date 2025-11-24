import { create } from "zustand";

export interface Reference {
  value: string;
  label: string;
  color: string;
  figId: string;
}

interface ReferenceStore {
  references: Reference[];
  addReference: (reference: Reference) => void;
  getReferenceById: (value: string) => Reference | undefined;
  getCurrentReference: () => Reference | undefined;
  removeReferenceById: (value: string) => void;
  getReferences: () => Reference[];
  clearReferences: () => void;
}

export const useReferenceStore = create<ReferenceStore>((set, get) => ({
  references: [],
  addReference: (reference: Reference) =>
    set((state) => ({ references: [...state.references, reference] })),
  getReferenceById: (value: string) =>
    get().references.find((reference) => reference.value === value),
  getCurrentReference: () => get().references[get().references.length - 1],
  removeReferenceById: (value: string) =>
    set((state) => ({
      references: state.references.filter(
        (reference) => reference.value !== value,
      ),
    })),
  getReferences: () => get().references,
  clearReferences: () => set({ references: [] }),
}));
