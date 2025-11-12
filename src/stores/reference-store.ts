import { create } from "zustand";


interface Reference {
    id: string;
    display: string;
    color: string;
    targetId?: string;
}

interface ReferenceStore {
    references: Reference[];
    addReference: (reference: Reference) => void;
    getReferenceById: (id: string) => Reference | undefined;
    getCurrentReference: () => Reference | undefined;
    setCurrentReferenceTargetId: (targetId: string) => void;
    removeReferenceById: (id: string) => void;
    getReferences: () => Reference[];
    clearReferences: () => void;
}

export const useReferenceStore = create<ReferenceStore>((set, get) => ({
    references: [],
    addReference: (reference: Reference) => set((state) => ({ references: [...state.references, reference] })),
    getReferenceById: (id: string) => get().references.find((reference) => reference.id === id),
    getCurrentReference: () => get().references[get().references.length - 1],
    setCurrentReferenceTargetId: (targetId: string) => set((state) => ({ references: state.references.map((reference) => reference.id === state.references[state.references.length - 1]?.id ? { ...reference, targetId } : reference) })),
    removeReferenceById: (id: string) => set((state) => ({ references: state.references.filter((reference) => reference.id !== id) })),
    getReferences: () => get().references,
    clearReferences: () => set({ references: [] }),
}));