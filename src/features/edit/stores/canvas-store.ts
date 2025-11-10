import { Canvas } from "fabric";
import { create } from "zustand";

export interface CanvasStore {
  canvasMap: Record<string, Canvas>;
  setCanvas: (key: string, canvas: Canvas) => void;
  getCanvas: (key: string) => Canvas;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  canvasMap: {},
  setCanvas: (key: string, canvas: Canvas) =>
    set((state) => ({ canvasMap: { ...state.canvasMap, [key]: canvas } })),
  getCanvas: (key: string) => get().canvasMap[key],
}));
