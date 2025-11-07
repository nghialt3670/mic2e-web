import { create } from "zustand";

export type AnnotationType = "box" | "point";

export interface Annotation {
  id: string;
  type: AnnotationType;
  color: string;
  data: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  attachmentId: string;
}

export interface AnnotationStore {
  annotations: Record<string, Annotation>;
  addAnnotation: (annotation: Annotation) => void;
  removeAnnotation: (id: string) => void;
  clearAnnotations: () => void;
  getAnnotationsByAttachment: (attachmentId: string) => Annotation[];
}

const COLORS = [
  "#ef4444", // red
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

let colorIndex = 0;

export const getNextColor = () => {
  const color = COLORS[colorIndex % COLORS.length];
  colorIndex++;
  return color;
};

export const resetColorIndex = () => {
  colorIndex = 0;
};

export const useAnnotationStore = create<AnnotationStore>((set, get) => ({
  annotations: {},
  addAnnotation: (annotation) =>
    set((state) => ({
      annotations: { ...state.annotations, [annotation.id]: annotation },
    })),
  removeAnnotation: (id) =>
    set((state) => {
      const { [id]: removed, ...rest } = state.annotations;
      return { annotations: rest };
    }),
  clearAnnotations: () => set({ annotations: {} }),
  getAnnotationsByAttachment: (attachmentId) =>
    Object.values(get().annotations).filter(
      (annotation) => annotation.attachmentId === attachmentId
    ),
}));

